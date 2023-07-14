import { useAllFormFields } from "payload/components/forms";
import { useConfig, useDocumentInfo, useLocale } from "payload/components/utilities";
import CopyToClipboard from "payload/dist/admin/components/elements/CopyToClipboard";
import { Fields } from "payload/dist/admin/components/forms/Form/types";
import RenderFields from "payload/dist/admin/components/forms/RenderFields";
import fieldTypes from "payload/dist/admin/components/forms/field-types";
import CloseMenu from "payload/dist/admin/components/icons/CloseMenu";
import Edit from "payload/dist/admin/components/icons/Edit";
import { ContextType } from "payload/dist/admin/components/utilities/DocumentInfo/types";
import { Field } from "payload/types";
import React, { MouseEvent as ReactMouseEvent, useEffect, useRef, useState } from "react";
import { PreviewUrlFn } from "../../types/previewUrl";
import { generateDocument } from "../../utils/generateDocument";
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
}

const updatePreview = async (fieldConfigs: Field[], fields: Fields, iframe: HTMLIFrameElement) => {
    try {
        const doc = await generateDocument(fieldConfigs, fields);

        iframe.contentWindow?.postMessage({ cmsLivePreviewData: doc }, "*");
    } catch (e) {
        console.error(e);
    }
};

const getFieldConfigs = (documentInfo: ContextType) => {
    return documentInfo.collection?.fields ?? documentInfo.global?.fields ?? [];
};

export const VisualEditor = (config: Config) => () => {
    const documentInfo = useDocumentInfo();
    const fieldConfigs = getFieldConfigs(documentInfo);
    const [fields] = useAllFormFields();

    const root = document.querySelector(":root") as HTMLElement;
    const editorContainer = document.querySelector(".collection-edit, .global-edit")!;
    const iframe = useRef<HTMLIFrameElement>(null);
    const resizeContainer = useRef<HTMLDivElement>(null);

    const debounce = useRef(false);

    const [previewSizeDisplay, setPreviewSizeDisplay] = useState("");

    // handle localization in previewUrl
    const { localization } = useConfig();
    const locale = useLocale();

    const previewUrl = localization ? config.previewUrl({ locale }) : config.previewUrl({ locale: "" });

    useEffect(() => {
        editorContainer.classList.add("visual-editor");
        editorContainer.classList.add("show-preview");

        // check local storage for last sidebar width
        const storedSidebarWidth = localStorage.getItem("visualEditorSidebar");

        if (storedSidebarWidth) {
            root.style.setProperty("--visualeditor-sidebar-width", `${storedSidebarWidth}px`);
        }
    }, []);

    useResizeObserver(resizeContainer, ([entry]) => {
        setPreviewSizeDisplay(`${entry.contentRect.width} x ${entry.contentRect.height}`);
    });

    useEffect(() => {
        if (debounce.current) {
            return;
        }

        debounce.current = true;

        setTimeout(() => {
            updatePreview(fieldConfigs, fields, iframe.current!);

            debounce.current = false;
        }, 100);
    }, [fields]);

    const onIframeLoaded = () => {
        setTimeout(() => {
            updatePreview(fieldConfigs, fields, iframe.current!);
        }, 100);
    };

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
                                <button className="toggleVisualEditor" type="button" onClick={togglePreview}>
                                    <CloseMenu />
                                </button>
                            </div>

                            <iframe
                                id="live-preview-iframe"
                                ref={iframe}
                                src={previewUrl}
                                onLoad={onIframeLoaded}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};


export const AdminSidebar = () => {
    const documentInfo = useDocumentInfo();
    const fieldConfigs = getFieldConfigs(documentInfo);
    const baseClass = "collection-edit";

    const {
        serverURL,
        routes: { api }
    } = useConfig();

    const collection = documentInfo.collection;
    const apiURL = `${serverURL}${api}/${collection?.slug}/${documentInfo.id}${collection?.versions?.drafts ? "?draft=true" : ""}`;

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
            </ul>
        </div>
    );
};

