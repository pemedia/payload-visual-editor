import { useAllFormFields } from "payload/components/forms";
import CloseMenu from "payload/dist/admin/components/icons/CloseMenu";
import Edit from "payload/dist/admin/components/icons/Edit";
import { Props } from "payload/dist/admin/components/forms/field-types/Blocks/types";
import { Fields } from "payload/dist/admin/components/forms/Form/types";
import { CollectionConfig } from "payload/types";
import React, { MouseEvent, MutableRefObject, useEffect, useRef, useState } from "react";
import { convert } from "./fieldsConverter";

import "./styles.scss";

interface Config {
    getCollectionConfig: () => CollectionConfig
    previewUrl: string;
}

const updatePreview = async (config: Config, fields: Fields, iframeRef: MutableRefObject<HTMLIFrameElement>) => {
    try {
        const collectionConfig = config.getCollectionConfig();
        const post = await convert(collectionConfig, fields);
        iframeRef.current.contentWindow.postMessage({ cmsLivePreviewData: post }, "*");
    } catch (e) {
        console.error(e);
    }
}

export const VisualEditor = (config: Config) => (props: Props) => {
    const iframe = useRef<HTMLIFrameElement>(null);
    const resizeContainer = useRef<HTMLDivElement>(null);
    const debounce = useRef(false);

    const [fields] = useAllFormFields();
    const [sizeDisplayContent, setSizeDisplayContent] = useState("");

    useEffect(() => {
        document.querySelector(".collection-edit, .global-edit").setAttribute("visualeditor", "true");
        document.querySelector(".collection-edit, .global-edit").setAttribute("showeditor", "true");
        canvasSizeObserver.observe(resizeContainer.current);
    }, []);

    useEffect(() => {
        if (debounce.current) {
            return;
        }

        debounce.current = true;

        setTimeout(() => {
            updatePreview(config, fields, iframe);

            debounce.current = false;
        }, 100);
    }, [fields]);

    const onIframeLoaded = (e: any) => {
        setTimeout(() => {
            updatePreview(config, fields, iframe);
        }, 100);
    };

    const toggleEditor = () => (e: MouseEvent) => {
        const showEditor = document.querySelector(".collection-edit, .global-edit").getAttribute("showeditor");
        if (showEditor != "true") document.querySelector(".collection-edit, .global-edit").setAttribute("showeditor", "true");
        else document.querySelector(".collection-edit, .global-edit").setAttribute("showeditor", "false");
    }

    const changeCanvasSize = (type: "desktop" | "tablet" | "mobile") => (e: MouseEvent) => {
        e.preventDefault();
        const sizeData = {
            "desktop": {
                width: "100%",
                height: "100%",
            },
            "tablet": {
                width: "768px",
                height: "1024px",
            },
            "mobile": {
                width: "375px",
                height: "668px",
            },
        }
        resizeContainer.current.setAttribute("style", `width:${sizeData[type].width}; height:${sizeData[type].height};`);
    }

    const canvasSizeObserver = new ResizeObserver(entries => {
        entries.forEach(entry => {
            setSizeDisplayContent(`${entry.contentRect.width} x ${entry.contentRect.height}`);
        });
    });

    return (
        <React.Fragment>
            <button className="toggleVisualEditor menu pill pill--has-action" type="button" onClick={toggleEditor()}><Edit /> Visual Editor</button>
            <div className="ContentEditor">
                <div className="live-preview-container">
                    <div className="live-preview">
                        <div
                            className="live-preview-resize-container"
                            ref={resizeContainer}
                        >
                            <div className="live-preview-settings">
                                <button className="pill pill--has-action" type="button" onClick={changeCanvasSize("desktop")}>Desktop</button>
                                <button className="pill pill--has-action" type="button" onClick={changeCanvasSize("tablet")}>Tablet</button>
                                <button className="pill pill--has-action" type="button" onClick={changeCanvasSize("mobile")}>Mobile</button>
                                <div className="pill size-display">{sizeDisplayContent}</div>
                                <button className="toggleVisualEditor" type="button" onClick={toggleEditor()}><CloseMenu /></button>
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
        </React.Fragment>
    );
};
