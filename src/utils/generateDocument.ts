import { reduceFieldsToValues } from "payload/components/forms";
import { Data, Fields } from "payload/dist/admin/components/forms/Form/types";
import {
    ArrayField,
    BlockField,
    FieldAffectingData,
    GroupField,
    RadioField,
    RelationshipField,
    SelectField,
    UploadField,
    ValueWithRelation,
    fieldAffectsData,
    fieldHasSubFields,
    fieldIsPresentationalOnly,
    optionIsObject
} from "payload/dist/fields/config/types";
import { Block, Field } from "payload/types";
import { match } from "ts-pattern";

const cache = new Map();


export interface GenDocConfig {
    fieldConfigs: Field[];
    serverUrl: string;
    apiPath: string;
}

export const generateDocument = async (config: GenDocConfig, fields: Fields) => {

    const fetchRelation = async (slug: string, id: string) => {
        const key = `${slug}_${id}`;

        if (cache.has(key)) {
            return cache.get(key);
        }

        const response = await fetch(`${config.serverUrl}${config.apiPath}/${slug}/${id}`);
        const data = await response.json();

        cache.set(key, data);

        return data;
    };


    const getBlock = (blocks: Block[], blockType: string) => {
        return blocks.find(b => b.slug === blockType)!;
    };

    const getAllFields = (fields: Field[]): Field[] => {
        return fields
            .filter((field) => !fieldIsPresentationalOnly(field))
            .flatMap(field => {
                if (fieldAffectsData(field)) {
                    return field;
                }

                if (field.type === "tabs") {
                    return field.tabs.flatMap(
                        tab => getAllFields(tab.fields)
                    );
                }

                if (fieldHasSubFields(field)) {
                    return getAllFields(field.fields);
                }

                console.error(field);
                throw new Error(`Unrecognized field type ${field.type}, please report at https://github.com/pemedia/payload-visual-editor/issues`);
            });
    };

    const convertArrayField = async (field: ArrayField, values: Data) => {
        const arrayFields = getAllFields(field.fields) as FieldAffectingData[];
        const arrayValues = values[field.name];

        const resolvedValues: any[] = [];

        if (Array.isArray(arrayValues)) {
            for (const value of arrayValues) {
                const result: any = {};

                for (let arrayField of arrayFields) {
                    result[arrayField.name!] = await getValue(arrayField, value);
                }

                resolvedValues.push(result);
            }
        }

        return resolvedValues;
    };

    const convertBlockField = async (field: BlockField, values: Data) => {
        const blockValues = values[field.name];

        if (field.required && !blockValues) {
            return [];
        }
        
        if (!field.required && !blockValues) {
            return undefined;
        }

        return Promise.all(
            blockValues.map(async (value: Data) => {
                const block = getBlock(field.blocks, value.blockType);
                const fields = getAllFields(block.fields) as FieldAffectingData[];

                const result: any = {
                    id: value.id,
                    blockType: value.blockType,
                };

                for (let field of fields) {
                    result[field.name!] = await getValue(field, value);
                }

                return result;
            }),
        );
    }

    const convertGroupField = async (field: GroupField, values: Data) => {
        const allGroupFields = getAllFields(field.fields) as FieldAffectingData[];
        const groupValues = values[field.name];

        const result: any = {};

        for (const field of allGroupFields) {
            result[field.name!] = await getValue(field, groupValues);
        }

        return result;
    };

    const convertRadioField = (field: RadioField, values: Data) => {
        const value = values[field.name];

        if (field.required && !value) {
            if (optionIsObject(field.options[0])) {
                return field.options[0].value;
            }

            return field.options[0];
        }

        return value;
    };

    const convertSingleTypeSingleValueRelationshipField = async (field: RelationshipField, values: Data) => {
        const relation = values[field.name] as string | undefined;

        if (field.required && !relation) {
            // NOTE: This is not the best way to fix relationship fields where the user didn't select the reference yet,
            // but I don't want to make the fields optional.
            // IDEA: We could use custom props in the field to define a default value, which will be used until a reference is selected.
            // How to make this requirement clear to the developer?
            // Or we could get the config for this relation and generate an empty document of it
            return {};
        }

        if (!field.required && !relation) {
            return undefined;
        }

        return fetchRelation(field.relationTo as string, relation!);
    };

    const convertSingleTypeMultiValueRelationshipField = (field: RelationshipField, values: Data) => {
        const relations = values[field.name] as string[] | undefined;

        if (field.required && !relations) {
            return [];
        }

        if (!field.required && !relations) {
            return undefined;
        }

        return Promise.all(
            relations!.map((id: string) =>
                fetchRelation(field.relationTo as string, id)
            )
        );
    };

    const convertMultiTypeSingleValueRelationshipField = async (field: RelationshipField, values: Data) => {
        const relation = values[field.name] as ValueWithRelation | undefined;

        if (field.required && !relation) {
            // NOTE: This is not the best way to fix relationship fields where the user didn't select the reference yet,
            // but I don't want to make the fields optional.
            // IDEA: We could use custom props in the field to define a default value, which will be used until a reference is selected.
            // How to make this requirement clear to the developer?
            // Or we could get the config for this relation and generate an empty document of it
            return {};
        }

        if (!field.required && !relation) {
            return undefined;
        }

        const value = await fetchRelation(relation!.relationTo, relation!.value as string);

        return {
            relationTo: relation!.relationTo,
            value,
        };
    };

    const convertMultiTypeMultiValueRelationshipField = (field: RelationshipField, values: Data) => {
        const relations = values[field.name];

        if (field.required && !relations) {
            return [];
        }

        if (!field.required && !relations) {
            return undefined;
        }

        return Promise.all(
            relations.map(async (relation: ValueWithRelation) => {
                const value = await fetchRelation(relation.relationTo, relation.value as string);

                return {
                    relationTo: relation.relationTo,
                    value,
                };
            }),
        );
    };

    const convertRelationshipField = (field: RelationshipField, values: Data) => {
        const isSingleType = typeof field.relationTo === "string";
        const isSingleValue = field.hasMany ? false : true;

        return match([isSingleType, isSingleValue])
            .with([true, true], () => convertSingleTypeSingleValueRelationshipField(field, values))
            .with([true, false], () => convertSingleTypeMultiValueRelationshipField(field, values))
            .with([false, true], () => convertMultiTypeSingleValueRelationshipField(field, values))
            .with([false, false], () => convertMultiTypeMultiValueRelationshipField(field, values))
            .exhaustive();
    };

    const convertSingleSelectField = (field: SelectField, values: Data) => {
        const value = values[field.name];

        if (field.required && !value) {
            if (optionIsObject(field.options[0])) {
                return field.options[0].value;
            }

            return field.options[0];
        }

        return value;
    };

    const convertMultiSelectField = (field: SelectField, values: Data) => {
        const value = values[field.name];

        if (field.required && !value) {
            return [];
        }

        return value;
    };

    const convertSelectField = (field: SelectField, values: Data) => {
        if (field.hasMany) {
            return convertMultiSelectField(field, values);
        } else {
            return convertSingleSelectField(field, values);
        }
    };

    const convertUploadField = (field: UploadField, values: Data) => {
        const id = values[field.name];

        if (field.required && !id) {
            // NOTE: This is not the best way to fix relationship fields where the user didn't select the reference yet,
            // but I don't want to make the fields optional.
            // IDEA: We could use custom props in the field to define a default value, which will be used until a reference is selected.
            // How to make this requirement clear to the developer?
            // Or we could get the config for this relation and generate an empty document of it
            return {};
        }

        return fetchRelation(field.relationTo, values[field.name]);
    };

    const convertSimpleField = (defaultValue: any) => (field: { name: string; required?: boolean; }, values: Data) => {
        const value = values[field.name];

        if (field.required) {
            return value ?? defaultValue;
        }

        return value;
    };

    const convertCheckboxField = convertSimpleField(false);
    const convertNumberField = convertSimpleField(0);
    const convertPointField = convertSimpleField([0, 0]);
    const convertRichTextField = convertSimpleField([]);
    const convertStringField = convertSimpleField("");

    const getValue = async (field: FieldAffectingData, values: Data) => match(field)
        .with({ type: "array" }, f => convertArrayField(f, values))
        .with({ type: "blocks" }, f => convertBlockField(f, values))
        .with({ type: "checkbox" }, f => convertCheckboxField(f, values))
        .with({ type: "code" }, f => convertStringField(f, values))
        .with({ type: "date" }, f => convertStringField(f, values))
        .with({ type: "email" }, f => convertStringField(f, values))
        .with({ type: "group" }, f => convertGroupField(f, values))
        .with({ type: "json" }, f => convertStringField(f, values))
        .with({ type: "number" }, f => convertNumberField(f, values))
        .with({ type: "point" }, f => convertPointField(f, values))
        .with({ type: "radio" }, f => convertRadioField(f, values))
        .with({ type: "relationship" }, f => convertRelationshipField(f, values))
        .with({ type: "richText" }, f => convertRichTextField(f, values))
        .with({ type: "select" }, f => convertSelectField(f, values))
        .with({ type: "tab" }, _ => { throw new Error("tab field not implemented"); })
        .with({ type: "text" }, f => convertStringField(f, values))
        .with({ type: "textarea" }, f => convertStringField(f, values))
        .with({ type: "upload" }, f => convertUploadField(f, values))
        .exhaustive();




    const { fieldConfigs } = config;

    const allFields = getAllFields(fieldConfigs) as FieldAffectingData[];
    const values = reduceFieldsToValues(fields, true);

    const result: any = {
        // todo: id
        createdAt: values.createdAt,
        updatedAt: values.updatedAt,
    };

    for (let field of allFields) {
        result[field.name!] = await getValue(field, values);
    }
    return result;

};
