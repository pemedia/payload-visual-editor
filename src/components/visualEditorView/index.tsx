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
import { match } from "ts-pattern";
import { PreviewMode } from "../../types/previewMode";
import { PreviewUrlFn } from "../../types/previewUrl";
import NewWindow from "../icons/NewWindow";
import SideBySide from "../icons/SideBySide";
import { IFramePreview, PopupPreview } from "../preview";
import { usePersistentState } from "./usePersistentState";

type Options = {
    previewUrl: PreviewUrlFn;
    defaultPreviewMode: PreviewMode;
}

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

export const createVisualEditorView = (options: Options) => (props_: Props) => {
    const props = getCollectionOrGlobalProps(props_);

    const [previewMode, setPreviewMode] = usePersistentState<PreviewMode>("visualEditorPreviewState", options.defaultPreviewMode);

    const { i18n, t } = useTranslation("general");

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

            <div className={`visual-editor ${previewMode}`}>
                <DocumentFields
                    description={props.description}
                    fieldTypes={props.fieldTypes}
                    fields={props.fields}
                    forceSidebarWrap
                    hasSavePermission={props.hasSavePermission}
                    permissions={props.permissions}
                />

                {match(previewMode)
                    .with("iframe", () => (
                        <div className="preview-container">
                            <IFramePreview
                                previewUrlFn={options.previewUrl}
                                setPreviewMode={setPreviewMode}
                            />
                        </div>
                    ))
                    .with("popup", () => (
                        <PopupPreview
                            previewUrlFn={options.previewUrl}
                            setPreviewMode={setPreviewMode}
                        />
                    ))
                    .with("none", () => (
                        <div className="preview-container sidebar">
                            <button
                                type="button"
                                className="btn"
                                title={`live preview side by side`}
                                onClick={() => setPreviewMode("iframe")}>
                                <SideBySide />
                            </button>
                            <button
                                type="button"
                                className="btn"
                                title={`live preview in a new window`}
                                onClick={() => setPreviewMode("popup")}>
                                <NewWindow />
                            </button>
                        </div>
                    ))
                    .exhaustive()
                }
            </div>
        </Fragment>
    );
};
