import { useAllFormFields } from "payload/components/forms";
import { useDocumentInfo } from "payload/components/utilities";
import { Fields } from "payload/dist/admin/components/forms/Form/types";
import CloseMenu from "payload/dist/admin/components/icons/CloseMenu";
import Edit from "payload/dist/admin/components/icons/Edit";
import { ContextType } from "payload/dist/admin/components/utilities/DocumentInfo/types";
import { Field } from "payload/types";
import React, { useEffect, useRef, useState } from "react";
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
    previewUrl: string;
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

    const editorContainer = document.querySelector(".collection-edit, .global-edit")!;
    const iframe = useRef<HTMLIFrameElement>(null);
    const resizeContainer = useRef<HTMLDivElement>(null);

    const debounce = useRef(false);

    const sidebarWidth = useRef(0);
    const dragging = useRef(false);
    const previousClientX = useRef(0);

    const [previewSizeDisplay, setPreviewSizeDisplay] = useState("");

    useEffect(() => {
        editorContainer?.classList.add("visual-editor");
        editorContainer?.classList.add("show-preview");

        // check local storage for last sidebar width
        const storedSidebarWidth = localStorage.getItem("visualEditorSidebar");
        if(storedSidebarWidth) {
            document.querySelector(':root').style.setProperty('--visualeditor-sidebar-width', `${storedSidebarWidth}px`);
        }
        window.addEventListener("mouseup", sidebarDrag);
        document.body.addEventListener("mouseup", sidebarDrag);
        document.addEventListener("mouseup", sidebarDrag);
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

    const sidebarDrag = (e) => {
        const sidebarElem = document.querySelector(".collection-edit.visual-editor .collection-edit__edit > .render-fields, .global-edit.visual-editor .global-edit__edit > .render-fields");
        if (e.type === "mousedown") {
            e.preventDefault();
            sidebarWidth.current = sidebarElem.offsetWidth;
            dragging.current = true;
            previousClientX.current = e.clientX;
            window.addEventListener("mousemove", sidebarMove)

            document.querySelector('#live-preview-iframe').setAttribute('dragging','true');

        } else {
            dragging.current = false;
            window.removeEventListener("mousemove", sidebarMove)
        }
    }

    const sidebarMove = (e) => {
        if(dragging.current === true && sidebarWidth.current != 0 && e.which == 1) {
            e.preventDefault();
            const r = document.querySelector(':root');
            const change = e.clientX - previousClientX.current;

            let newValue = sidebarWidth.current + change;
            if(newValue < 350) newValue = 350;

            r.style.setProperty('--visualeditor-sidebar-width', `${newValue}px`);
            localStorage.setItem("visualEditorSidebar", newValue);
        } else {
            document.querySelector('#live-preview-iframe').setAttribute('dragging','false');
        }
    }

    const togglePreview = () => {
        editorContainer.classList.toggle("show-preview");
    };

    const setPreviewSize = (size: { width: string; height: string; }) => () => {
        resizeContainer.current!.setAttribute("style", `width:${size.width}; height:${size.height};`);
    };

    return (
        <>
            <button className="toggleVisualEditor menu pill pill--has-action" type="button" onClick={togglePreview}>
                <Edit /> Visual Editor
            </button>

            <div className="ContentEditor">
                <div className="live-preview-container">
                    <div className="sidebar-drag-handle" onMouseDown={sidebarDrag} onMouseUp={sidebarDrag}></div>
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
                                src={config.previewUrl}
                                onLoad={onIframeLoaded}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
