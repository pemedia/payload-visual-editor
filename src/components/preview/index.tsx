import { useAllFormFields } from "payload/components/forms";
import { useConfig, useDocumentInfo, useLocale } from "payload/components/utilities";
import { Fields } from "payload/dist/admin/components/forms/Form/types";
import CloseMenu from "payload/dist/admin/components/icons/CloseMenu";
import { ContextType } from "payload/dist/admin/components/utilities/DocumentInfo/types";
import React, { MouseEvent as ReactMouseEvent, useEffect, useRef, useState } from "react";
import { PreviewUrlFn } from "../../types/previewUrl";
import { GenDocConfig, generateDocument } from "../../utils/generateDocument";
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

interface Props {
    previewUrl: PreviewUrlFn;
    close: () => void;
}

const updatePreview = async (genDocConfig: GenDocConfig, fields: Fields, iframe: HTMLIFrameElement) => {
    try {
        const doc = await generateDocument(genDocConfig, fields);

        iframe.contentWindow?.postMessage({ cmsLivePreviewData: doc }, "*");
    } catch (e) {
        console.error(e);
    }
};

const getFieldConfigs = (documentInfo: ContextType) => {
    return documentInfo.collection?.fields ?? documentInfo.global?.fields ?? [];
};

export const Preview = (props: Props) => {
    const payloadConfig = useConfig();
    const documentInfo = useDocumentInfo();
    const fieldConfigs = getFieldConfigs(documentInfo);
    const [fields] = useAllFormFields();

    const root = document.querySelector(":root") as HTMLElement;
    const iframe = useRef<HTMLIFrameElement>(null);
    const resizeContainer = useRef<HTMLDivElement>(null);

    const debounce = useRef(false);

    const [previewSizeDisplay, setPreviewSizeDisplay] = useState("");

    const genDocConfig: GenDocConfig = {
        collections: payloadConfig.collections,
        globals: payloadConfig.globals,
        fieldConfigs,
        serverUrl: payloadConfig.serverURL,
        apiPath: payloadConfig.routes.api,
    };

    // handle localization in previewUrl
    const locale = useLocale();
    const previewUrl = payloadConfig.localization ? props.previewUrl({ locale: locale.code }) : props.previewUrl({ locale: "" });

    useResizeObserver(resizeContainer, ([entry]) => {
        setPreviewSizeDisplay(`${entry.contentRect.width} x ${entry.contentRect.height}`);
    });

    useEffect(() => {
        if (debounce.current) {
            return;
        }

        debounce.current = true;

        setTimeout(() => {
            updatePreview(genDocConfig, fields, iframe.current!);

            debounce.current = false;
        }, 100);
    }, [fields]);

    const onIframeLoaded = () => {
        setTimeout(() => {
            updatePreview(genDocConfig, fields, iframe.current!);
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

    const setPreviewSize = (size: { width: string; height: string; }) => () => {
        resizeContainer.current!.setAttribute("style", `width:${size.width}; height:${size.height};`);
    };

    return (
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
                <button className="close" type="button" onClick={props.close}>
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
    );

    // return (
    //     <div className="ContentEditor">
    //         <div className="live-preview-container">
    //             <div className="sidebar-drag-handle" onMouseDown={sidebarDragStart}></div>
    //             <div className="live-preview">
    //                 <div className="live-preview-resize-container" ref={resizeContainer}>
    //                     <div className="live-preview-settings">
    //                         <button className="pill pill--has-action" type="button" onClick={setPreviewSize(SCREEN_SIZES.desktop)}>
    //                             Desktop
    //                         </button>
    //                         <button className="pill pill--has-action" type="button" onClick={setPreviewSize(SCREEN_SIZES.tablet)}>
    //                             Tablet
    //                         </button>
    //                         <button className="pill pill--has-action" type="button" onClick={setPreviewSize(SCREEN_SIZES.mobile)}>
    //                             Mobile
    //                         </button>
    //                         <div className="pill size-display">
    //                             {previewSizeDisplay}
    //                         </div>
    //                         <button className="toggleVisualEditor" type="button" onClick={togglePreview}>
    //                             <CloseMenu />
    //                         </button>
    //                     </div>

    //                     <iframe
    //                         id="live-preview-iframe"
    //                         ref={iframe}
    //                         src={previewUrl}
    //                         onLoad={onIframeLoaded}
    //                     />
    //                 </div>
    //             </div>
    //         </div>
    //     </div>
    // );
};
