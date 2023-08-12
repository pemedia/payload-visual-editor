import { useConfig, useDocumentInfo, useLocale } from "payload/components/utilities";
import CopyToClipboard from "payload/dist/admin/components/elements/CopyToClipboard";
import VersionsCount from "payload/dist/admin/components/elements/VersionsCount";
import { Fields } from "payload/dist/admin/components/forms/Form/types";
import RenderFields from "payload/dist/admin/components/forms/RenderFields";
import fieldTypes from "payload/dist/admin/components/forms/field-types";
import CloseMenu from "payload/dist/admin/components/icons/CloseMenu";
import Edit from "payload/dist/admin/components/icons/Edit";
import RelationShip from "payload/dist/admin/components/icons/Relationship";
import { ContextType } from "payload/dist/admin/components/utilities/DocumentInfo/types";
import { formatDate } from "payload/dist/admin/utilities/formatDate";
import React, { MouseEvent as ReactMouseEvent, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { match } from "ts-pattern";
import { PreviewUrlFn } from "../../types/previewUrl";
import { GenDocConfig, generateDocument } from "../../utils/generateDocument";
import { useFields } from "./useFields";
import { useOnFieldChanges } from "./useOnFieldChanges";
import { useOnPreviewMessage } from "./useOnPreviewMessage";
import { useResizeObserver } from "./useResizeObserver";

const SCREEN_SIZES = {
    desktop: {
        width: "100%",
        height: "100%",
    },
    tablet: {
        width: "768px",
        height: "1024px",
    },
    mobile: {
        width: "375px",
        height: "668px",
    },
};

interface Config {
    previewUrl: PreviewUrlFn;
    showPreview?: boolean;
}

const updatePreview = async (genDocConfig: GenDocConfig, fields: Fields, iframe: HTMLIFrameElement, previewWindow: Window | null) => {
    try {
        const doc = await generateDocument(genDocConfig, fields);

        iframe.contentWindow?.postMessage({ cmsLivePreviewData: doc }, "*");
        previewWindow?.postMessage({ cmsLivePreviewData: doc }, "*");
    } catch (e) {
        console.error(e);
    }
};

const selectInput = (name: string) => {
    const element = document.getElementById(`field-${name}`);

    if (!element) {
        return;
    }

    if (element.tagName === "INPUT") {
        return (element as HTMLInputElement).select();
    }

    const childElement = element.querySelector("input");

    if (!childElement) {
        return;
    }

    childElement.select();
};

const getFieldConfigs = (documentInfo: ContextType) => {
    return documentInfo.collection?.fields ?? documentInfo.global?.fields ?? [];
};

const getShouldShowPreview = (config: Config) => {
    // check local storage first
    const fromStorage = localStorage.getItem("visualEditorShowPreview");

    if (fromStorage) {
        if (fromStorage === "false") {
            return false;
        }

        if (fromStorage === "true") {
            return true;
        }
    }

    // check config second 
    if (config.showPreview === false) {
        return false;
    }

    // default
    return true;
};

export const VisualEditor = (config: Config) => () => {
    const documentInfo = useDocumentInfo();
    const fieldConfigs = getFieldConfigs(documentInfo);
    const fields = useFields();

    const root = document.querySelector(":root") as HTMLElement;
    const editorContainer = document.querySelector(".collection-edit, .global-edit")!;
    const iframe = useRef<HTMLIFrameElement>(null);
    const resizeContainer = useRef<HTMLDivElement>(null);
    const previewWindow = useRef<Window | null>(null);

    const [previewSizeDisplay, setPreviewSizeDisplay] = useState("");

    const {
        localization,
        serverURL,
        routes: { api }
    } = useConfig();

    const configParams: GenDocConfig = {
        fieldConfigs: fieldConfigs,
        serverUrl: serverURL,
        apiPath: api
    }

    // handle localization in previewUrl
    const locale = useLocale();
    const previewUrl = localization ? config.previewUrl({ locale }) : config.previewUrl({ locale: "" });

    useEffect(() => {
        editorContainer.classList.add("visual-editor");

        if (getShouldShowPreview(config)) {
            editorContainer.classList.add("show-preview");
        }

        if (documentInfo.collection?.versions || documentInfo.global?.versions) {
            editorContainer.classList.add("versions");
        }

        // check local storage for last sidebar width
        const storedSidebarWidth = localStorage.getItem("visualEditorSidebar");

        if (storedSidebarWidth) {
            root.style.setProperty("--visualeditor-sidebar-width", `${storedSidebarWidth}px`);
        }

        return () => {
            if (previewWindow.current) {
                previewWindow.current.close();
            }
        };
    }, []);

    useOnPreviewMessage(previewUrl, message => {
        match(message)
            .with({ type: "ready" }, () => updatePreview(configParams, fields.current, iframe.current!, previewWindow.current))
            .with({ type: "select" }, ({ name }) => selectInput(name))
            .exhaustive();
    });

    useResizeObserver(resizeContainer, ([entry]) => {
        setPreviewSizeDisplay(`${entry.contentRect.width} x ${entry.contentRect.height}`);
    });

    useOnFieldChanges(fields.current, () => {
        updatePreview(configParams, fields.current, iframe.current!, previewWindow.current);
    });

    const sidebarDragStart = (e: ReactMouseEvent) => {
        e.preventDefault();

        const sidebar = e.currentTarget.closest(".render-fields")!;
        const sidebarBounds = sidebar.getBoundingClientRect();

        // prevent iframe from capturing events
        iframe.current!.style.setProperty("pointer-events", "none");

        const resize = (e: MouseEvent) => {
            const newWidth = Math.max(350, e.pageX - sidebarBounds.left);

            root.style.setProperty("--visualeditor-sidebar-width", `${newWidth}px`);
        };

        window.addEventListener("mousemove", resize);

        window.addEventListener("mouseup", () => {
            window.removeEventListener("mousemove", resize);

            // reset
            iframe.current!.style.removeProperty("pointer-events");
        }, { once: true });
    };

    const togglePreview = () => {
        editorContainer.classList.toggle("show-preview");
        localStorage.setItem("visualEditorShowPreview", editorContainer.classList.contains("show-preview").toString());
    };

    const openPreviewWindow = () => {
        previewWindow.current = open(previewUrl, "preview", "popup");

        if (previewWindow.current) {
            togglePreview();

            const timer = setInterval(() => {
                if (previewWindow.current!.closed) {
                    clearInterval(timer);
                    togglePreview();
                    previewWindow.current = null;
                }
            }, 1000);
        }
    };

    const setPreviewSize = (size: { width: string; height: string; }) => () => {
        resizeContainer.current!.setAttribute("style", `width:${size.width}; height:${size.height};`);
    };

    return (
        <>
            <button className="toggleVisualEditor menu pill pill--has-action" type="button" onClick={togglePreview}>
                <Edit /> Live Preview
            </button>

            <div className="ContentEditor">
                <div className="live-preview-container">
                    <div className="sidebar-drag-handle" onMouseDown={sidebarDragStart}></div>
                    <div className="live-preview">
                        <div className="live-preview-resize-container" ref={resizeContainer}>
                            <div className="live-preview-settings">
                                <button className="pill pill--has-action" type="button" onClick={setPreviewSize(SCREEN_SIZES.desktop)}>
                                    Desktop
                                </button>
                                <button className="pill pill--has-action" type="button" onClick={setPreviewSize(SCREEN_SIZES.tablet)}>
                                    Tablet
                                </button>
                                <button className="pill pill--has-action" type="button" onClick={setPreviewSize(SCREEN_SIZES.mobile)}>
                                    Mobile
                                </button>
                                <div className="pill size-display">
                                    {previewSizeDisplay}
                                </div>

                                <button className="openInWindow" type="button" onClick={openPreviewWindow}>
                                    <RelationShip />
                                </button>
                                <button className="toggleVisualEditor" type="button" onClick={togglePreview}>
                                    <CloseMenu />
                                </button>
                            </div>

                            <iframe
                                id="live-preview-iframe"
                                ref={iframe}
                                src={previewUrl}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};


export const AdminSidebar = () => {
    const {
        serverURL,
        admin: { dateFormat },
        routes: { api }
    } = useConfig();

    const documentInfo = useDocumentInfo();
    const fieldConfigs = getFieldConfigs(documentInfo);

    const docType: string = (documentInfo.collection) ? "collection" : "global"
    const docTypeData = (documentInfo.collection) ? documentInfo.collection : documentInfo.global;
    const baseClass = `${docType}-edit`;
    const locale = useLocale();

    const { t, i18n } = useTranslation("general");

    const additionalMeta = () => {

        if (docType == "collection") {

            const publishedDoc = documentInfo.publishedDoc;
            const collection = documentInfo.collection;
            const id = documentInfo.id;

            const updatedAt = publishedDoc?.updatedAt;
            const versions = collection?.versions;

            return (
                <React.Fragment>
                    {versions && (
                        <li>
                            <div className={`${baseClass}__label`}>{t("version:versions")}</div>
                            <VersionsCount
                                collection={collection}
                                id={id}
                            />
                        </li>
                    )}
                    {updatedAt && (
                        <li>
                            <div className={`${baseClass}__label`}>{t("lastModified")}</div>
                            <div>{formatDate(updatedAt, dateFormat, i18n?.language)}</div>
                        </li>
                    )}
                    {(publishedDoc?.createdAt) && (
                        <li>
                            <div className={`${baseClass}__label`}>{t("created")}</div>
                            <div>{formatDate(publishedDoc?.createdAt, dateFormat, i18n?.language)}</div>
                        </li>
                    )}
                </React.Fragment>
            )
        } else if (docType == "global") {

            const publishedDoc = documentInfo.publishedDoc;
            const global = documentInfo.global;

            const updatedAt = publishedDoc?.updatedAt;
            const versions = global?.versions;

            return (
                <React.Fragment>
                    {versions && (
                        <li>
                            <div className={`${baseClass}__label`}>{t("version:versions")}</div>
                            <VersionsCount global={global} />
                        </li>
                    )}
                    {updatedAt && (
                        <li>
                            <div className={`${baseClass}__label`}>{t("lastModified")}</div>
                            <div>{formatDate(updatedAt, dateFormat, i18n?.language)}</div>
                        </li>
                    )}
                </React.Fragment>
            )

        }

        return null;

    }

    if (!docTypeData) {
        return null;
    }

    const apiURL = (docType === "collection")
        ? `${serverURL}${api}/${docTypeData?.slug}/${documentInfo.id}?locale=${locale}${docTypeData?.versions.drafts ? "&draft=true" : ""}`
        : `${serverURL}${api}/globals/${docTypeData?.slug}?locale=${locale}${docTypeData?.versions?.drafts ? "?draft=true" : ""}`;

    return (
        <div className="ContentEditorAdminSidebar">
            {(fieldConfigs.filter(e => e.admin?.position === "sidebar").length > 0) ? (
                <RenderFields
                    readOnly={false}
                    permissions={documentInfo.docPermissions?.fields}
                    filter={(field) => field?.admin?.position === "sidebar"}
                    fieldTypes={fieldTypes}
                    fieldSchema={fieldConfigs}
                />
            ) : null}

            <ul className={`${baseClass}__meta`}>
                <li className={`${baseClass}__api-url`}>
                    <span className={`${baseClass}__label`}>
                        API URL
                        {" "}
                        <CopyToClipboard value={apiURL} />
                    </span>
                    <a href={apiURL} target="_blank" rel="noopener noreferrer">{apiURL}</a>
                </li>
                {additionalMeta()}
            </ul>
        </div>
    );
};
