import { ExternalLinkIcon } from "payload/dist/admin/components/graphics/ExternalLink";
import CloseMenu from "payload/dist/admin/components/icons/CloseMenu";
import React, { useRef, useState } from "react";
import { PreviewMode } from "../../../types/previewMode";
import { PreviewUrlFn } from "../../../types/previewUrl";
import { usePreview } from "../hooks/usePreview";
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
    previewUrlFn: PreviewUrlFn;

    setPreviewMode: (mode: PreviewMode) => void;
}

export const IFramePreview = (props: Props) => {
    // const root = document.querySelector(":root") as HTMLElement;
    const iframe = useRef<HTMLIFrameElement>(null);
    const resizeContainer = useRef<HTMLDivElement>(null);

    const [previewSizeDisplay, setPreviewSizeDisplay] = useState("");

    const previewUrl = usePreview(props.previewUrlFn, iframe);

    useResizeObserver(resizeContainer, ([entry]) => {
        setPreviewSizeDisplay(`${entry.contentRect.width} x ${entry.contentRect.height}`);
    });

    // const sidebarDragStart = (e: ReactMouseEvent) => {
    //     e.preventDefault();

    //     const sidebar = e.currentTarget.closest(".render-fields")!;
    //     const sidebarBounds = sidebar.getBoundingClientRect();

    //     // prevent iframe from capturing events
    //     iframe.current!.style.setProperty("pointer-events", "none");

    //     const resize = (e: MouseEvent) => {
    //         const newWidth = Math.max(350, e.pageX - sidebarBounds.left);

    //         root.style.setProperty("--visualeditor-sidebar-width", `${newWidth}px`);
    //     };

    //     window.addEventListener("mousemove", resize);

    //     window.addEventListener("mouseup", () => {
    //         window.removeEventListener("mousemove", resize);

    //         // reset
    //         iframe.current!.style.removeProperty("pointer-events");
    //     }, { once: true });
    // };

    const setPreviewSize = (size: { width: string; height: string; }) => () => {
        resizeContainer.current!.setAttribute("style", `width:${size.width}; height:${size.height};`);
    };

    return (
        <div className="live-preview-resize-container" ref={resizeContainer}>
            <div className="live-preview-settings">
                <div>
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
                </div>

                <div>
                    <button className="openInWindow" type="button" onClick={() => props.setPreviewMode("popup")}>
                        <ExternalLinkIcon />
                    </button>
                    <button className="close" type="button" onClick={() => props.setPreviewMode("none")}>
                        <CloseMenu />
                    </button>
                </div>
            </div>

            <iframe
                id="live-preview-iframe"
                ref={iframe}
                src={previewUrl}
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
