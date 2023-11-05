import { Meta } from "payload/components/utilities";
import { FieldTypes } from "payload/config";
import { DocumentControls } from "payload/dist/admin/components/elements/DocumentControls";
import { DocumentFields } from "payload/dist/admin/components/elements/DocumentFields";
import { LeaveWithoutSaving } from "payload/dist/admin/components/modals/LeaveWithoutSaving";
import { SetStepNav } from "payload/dist/admin/components/views/collections/Edit/SetStepNav";
import { CollectionEditViewProps, GlobalEditViewProps } from "payload/dist/admin/components/views/types";
import { getTranslation } from "payload/dist/utilities/getTranslation";
import React, { Fragment, useState } from "react";
import { useTranslation } from "react-i18next";
import { VisualEditor } from "../visualEditor";
import { PreviewUrlFn } from "../../types/previewUrl";

type Props = (CollectionEditViewProps | GlobalEditViewProps) & { fieldTypes: FieldTypes };

const getCollectionOrGlobalProps = (props: Props) => {
    if ("collection" in props) {
        return ({
            apiURL: props.apiURL,
            fieldTypes: props.fieldTypes,
            data: props.data,
            permissions: props.permissions!,

            collection: props.collection,
            disableActions: props.disableActions,
            disableLeaveWithoutSaving: props.disableLeaveWithoutSaving,
            hasSavePermission: props.hasSavePermission!,
            isEditing: props.isEditing!,
            id: props.id,
            fields: props.collection?.fields,
        });
    }

    return ({
        apiURL: props.apiURL,
        fieldTypes: props.fieldTypes,
        data: props.data,
        permissions: props.permissions!,

        global: props.global,
        fields: props.global.fields,
        label: props.global.label,
        description: props.global.admin?.description,
        hasSavePermission: props.permissions?.update?.permission!,
    });
};

export const createVisualEditorView = (options: { previewUrl: PreviewUrlFn }) => (props_: Props) => {
    const props = getCollectionOrGlobalProps(props_);

    const [showPreview, setShowPreview_] = useState(localStorage.getItem("visualEditorShowPreview") === "true");

    const { i18n, t } = useTranslation("general");
    // const { previewWindowType } = useLivePreviewContext()

    const closePreview = () => {
        localStorage.setItem("visualEditorShowPreview", "false");
        setShowPreview_(false);
    };

    const openPreview = () => {
        localStorage.setItem("visualEditorShowPreview", "true");
        setShowPreview_(true);
    };

    return (
        <Fragment>
            {props.collection && (
                <Meta
                    description={t("editing")}
                    keywords={`${getTranslation(props.collection.labels.singular, i18n)}, Payload, CMS`}
                    title={`${props.isEditing ? t("editing") : t("creating")} - ${getTranslation(props.collection.labels.singular, i18n)}`}
                />
            )}

            {props.global && (
                <Meta
                    description={getTranslation(props.label, i18n)}
                    keywords={`${getTranslation(props.label, i18n)}, Payload, CMS`}
                    title={getTranslation(props.label, i18n)}
                />
            )}

            {((props.collection && !(props.collection.versions?.drafts && props.collection.versions?.drafts?.autosave)) ||
                (props.global && !(props.global.versions?.drafts && props.global.versions?.drafts?.autosave))) &&
                !props.disableLeaveWithoutSaving && <LeaveWithoutSaving />}

            {props.collection && (
                <SetStepNav
                    collection={props.collection}
                    id={props.id}
                    isEditing={props.isEditing}
                    view={t("edit")}
                />
            )}

            {props.global && (
                <SetStepNav
                    global={props.global}
                    view={t("edit")}
                />
            )}

            <DocumentControls
                apiURL={props.apiURL}
                collection={props.collection}
                data={props.data}
                disableActions={props.disableActions}
                global={props.global}
                hasSavePermission={props.hasSavePermission}
                id={props.id}
                isEditing={props.isEditing}
                permissions={props.permissions}
            />

            <div className={showPreview ? "visual-editor open" : "visual-editor"}>
                <DocumentFields
                    description={props.description}
                    fieldTypes={props.fieldTypes}
                    fields={props.fields}
                    forceSidebarWrap
                    hasSavePermission={props.hasSavePermission}
                    permissions={props.permissions}
                />

                <div className={showPreview ? "preview" : "open-preview"}>
                    {showPreview
                        ? <VisualEditor
                            previewUrl={options.previewUrl}
                            close={closePreview} />
                        : <button
                            type="button"
                            className="btn btn--style-secondary btn--size-small"
                            onClick={openPreview}>{t("livePreview")}</button>
                    }
                </div>
            </div>
        </Fragment>
    );
};
