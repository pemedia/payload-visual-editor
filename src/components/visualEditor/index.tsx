import { useAllFormFields } from "payload/components/forms";
import { useDocumentInfo } from "payload/components/utilities";
import { Fields } from "payload/dist/admin/components/forms/Form/types";
import CloseMenu from "payload/dist/admin/components/icons/CloseMenu";
import Edit from "payload/dist/admin/components/icons/Edit";
import { ContextType } from "payload/dist/admin/components/utilities/DocumentInfo/types";
import { Field } from "payload/types";
import React, { useEffect, useRef, useState } from "react";
import { convert } from "./fieldsConverter";
import "./styles.scss";
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
        const doc = await convert(fieldConfigs, fields);

        iframe.contentWindow?.postMessage({ cmsLivePreviewData: doc }, "*");
    } catch (e) {
        console.error(e);
    }
}

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

    const [previewSizeDisplay, setPreviewSizeDisplay] = useState("");

    useEffect(() => {
        editorContainer?.classList.add("visual-editor");
        editorContainer?.classList.add("show-preview");
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
