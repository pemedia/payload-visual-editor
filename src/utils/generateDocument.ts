import { reduceFieldsToValues } from "payload/components/forms";
import { Data, Fields } from "payload/dist/admin/components/forms/Form/types";
import { FieldAffectingData } from "payload/dist/fields/config/types";
import { Block, Field } from "payload/types";

const cache = new Map();

const fetchRelation = async (slug: string, id: string) => {
    const key = `${slug}_${id}`;

    if (cache.has(key)) {
        return cache.get(key);
    }

    const response = await fetch(`/api/${slug}/${id}`);
    const data = await response.json();

    cache.set(key, data);

    return data;
};

const fetchRelations = async (slug: string, ids: string[]) => {
    return Promise.all(ids.map(id => fetchRelation(slug, id)));
};

const getBlock = (blocks: Block[], blockType: string) => {
    return blocks.find(b => b.slug === blockType);
};


const getAllFields = (fields: Field[]) => {
    // todo: add more cases
    return fields.flatMap(field => {
        if (field.type === "tabs") {
            return field.tabs.flatMap(tab => tab.fields);
        }

        return field;
    });
};

const getValue = async (field: FieldAffectingData, values: Data) => {
    if (field.type === "relationship" || field.type === "upload") {
        if (values[field.name] === undefined) {
            if (field.required) {
                // NOTE: This is not the best way to fix relationship fields where the user didn't select the reference yet,
                // but I don't want to make the fields optional.
                // IDEA: We could use custom props in the field to define a default value, which will be used until a reference is selected.
                // How to make this requirement clear to the developer?
                return {};
            }

            return undefined;
        }

        if (typeof field.relationTo !== "string") {
            throw new Error("not implemented");
        }

        if (field.type === "relationship" && field.hasMany) {
            return fetchRelations(field.relationTo, values[field.name]);
        } else {
            return fetchRelation(field.relationTo, values[field.name]);
        }
    }

    if (field.type === "array") {
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
    }

    if (field.type === "richText") {
        const value = values[field.name];

        if (value === undefined) {
            return [];
        }
    }

    if (field.type === "blocks") {
        const blockValues = values[field.name];

        return Promise.all(
            blockValues.map(async (value: Data) => {
                const fields = getBlock(field.blocks, value.blockType).fields as FieldAffectingData[];

                const result = {
                    id: value.id,
                    blockType: value.blockType,
                };

                for (let field of fields) {
                    result[field.name] = await getValue(field, value);
                }

                return result;
            }),
        );
    }

    if (field.type === "group") {
        // todo: Please check, because Jan coded this
        const allGroupFields = getAllFields(field.fields) as FieldAffectingData[];
        const groupValues = values[field.name];

        const result = {};
        for (let field of allGroupFields) {
            result[field.name] = await getValue(field, groupValues);
        }

        return result;

    }

    return values[field.name];
};

export const generateDocument = async (fieldConfigs: Field[], fields: Fields) => {
    const allFields = getAllFields(fieldConfigs) as FieldAffectingData[];
    const values = reduceFieldsToValues(fields, true);

    // console.log(allFields);
    // console.log(values);

    const result = {
        // todo: id
        createdAt: values.createdAt,
        updatedAt: values.updatedAt,
    };

    for (let field of allFields) {
        result[field.name] = await getValue(field, values);
    }

    // console.log('Payload result', result);

    return result;
};
