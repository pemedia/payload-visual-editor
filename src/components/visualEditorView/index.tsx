import { Meta } from "payload/components/utilities";
import { FieldTypes } from "payload/config";
import { DocumentControls } from "payload/dist/admin/components/elements/DocumentControls";
import { DocumentFields } from "payload/dist/admin/components/elements/DocumentFields";
import { LeaveWithoutSaving } from "payload/dist/admin/components/modals/LeaveWithoutSaving";
import { SetStepNav } from "payload/dist/admin/components/views/collections/Edit/SetStepNav";
import { CollectionEditViewProps, GlobalEditViewProps } from "payload/dist/admin/components/views/types";
import { getTranslation } from "payload/dist/utilities/getTranslation";
import React, { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { VisualEditor } from "../visualEditor";
import { PreviewUrlFn } from "../../types/previewUrl";

const baseClass = "visual-editor"

export const createVisualEditorView = (options: { previewUrl: PreviewUrlFn }) => (props: (CollectionEditViewProps | GlobalEditViewProps) & { fieldTypes: FieldTypes }) => {
    console.log(props)

    if ("collection" in props) {
        return <CollectionVisualEditorView previewUrl={options.previewUrl} {...props} />;
    } else {
        return <GlobalVisualEditorView previewUrl={options.previewUrl} {...props} />;
    }
};


const CollectionVisualEditorView = (props: (CollectionEditViewProps) & { previewUrl: PreviewUrlFn; fieldTypes: FieldTypes; }) => {
    const { i18n, t } = useTranslation("general")

    const { apiURL, data, fieldTypes, permissions } = props

    const collection = props.collection
    const disableActions = props.disableActions
    const disableLeaveWithoutSaving = props.disableLeaveWithoutSaving
    const hasSavePermission = props.hasSavePermission
    const isEditing = props.isEditing
    const id = props.id
    const fields = props.collection.fields

    return (
        <Fragment>
            <Meta
                description={t("editing")}
                keywords={`${getTranslation(collection.labels.singular, i18n)}, Payload, CMS`}
                title={`${isEditing ? t("editing") : t("creating")} - ${getTranslation(
                    collection.labels.singular,
                    i18n,
                )}`}
            />
            {(collection && !(collection.versions?.drafts && collection.versions?.drafts?.autosave)) &&
                !disableLeaveWithoutSaving && <LeaveWithoutSaving />}
            <SetStepNav
                collection={collection}
                global={global}
                id={id}
                isEditing={isEditing}
                view={t("livePreview")}
            />
            <DocumentControls
                apiURL={apiURL}
                collection={collection}
                data={data}
                disableActions={disableActions}
                hasSavePermission={hasSavePermission}
                id={id}
                isEditing={isEditing}
                permissions={permissions}
            />

            <div className={baseClass}>
                <DocumentFields
                    fieldTypes={fieldTypes}
                    fields={fields}
                    forceSidebarWrap
                    hasSavePermission={hasSavePermission}
                    permissions={permissions}
                />

                <div className="preview">
                    <VisualEditor previewUrl={props.previewUrl} />
                </div>
            </div>
        </Fragment>
    );
};

const GlobalVisualEditorView = (props: (GlobalEditViewProps) & { previewUrl: PreviewUrlFn; fieldTypes: FieldTypes; }) => {
    const { i18n, t } = useTranslation("general")

    const { apiURL, data, fieldTypes, permissions } = props

    const global = props?.global
    const fields = props?.global?.fields
    const label = props?.global?.label
    const description = props?.global?.admin?.description
    const hasSavePermission = permissions!.update.permission

    return (
        <Fragment>
            <Meta
                description={getTranslation(label, i18n)}
                keywords={`${getTranslation(label, i18n)}, Payload, CMS`}
                title={getTranslation(label, i18n)}
            />
            {(global && !(global.versions?.drafts && global.versions?.drafts?.autosave)) && <LeaveWithoutSaving />}
            <SetStepNav
                global={global}
                view={t("livePreview")}
            />
            <DocumentControls
                apiURL={apiURL}
                data={data}
                global={global}
                hasSavePermission={hasSavePermission}
                permissions={permissions}
            />

            <div className={baseClass}>
                <DocumentFields
                    description={description}
                    fieldTypes={fieldTypes}
                    fields={fields}
                    forceSidebarWrap
                    hasSavePermission={hasSavePermission}
                    permissions={permissions!}
                />

                <div className="preview">
                    <VisualEditor previewUrl={props.previewUrl} />
                </div>
            </div>
        </Fragment>
    );
};
