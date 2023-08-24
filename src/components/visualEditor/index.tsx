import { useConfig, useDocumentInfo, useLocale } from "payload/components/utilities";
import CopyToClipboard from "payload/dist/admin/components/elements/CopyToClipboard";
import VersionsCount from "payload/dist/admin/components/elements/VersionsCount";
import { Fields } from "payload/dist/admin/components/forms/Form/types";
import RenderFields from "payload/dist/admin/components/forms/RenderFields";
import fieldTypes from "payload/dist/admin/components/forms/field-types";
import CloseMenu from "payload/dist/admin/components/icons/CloseMenu";
import Chevron from "payload/dist/admin/components/icons/Chevron";
import Edit from "payload/dist/admin/components/icons/Edit";
import RelationShip from "payload/dist/admin/components/icons/Relationship";
import { ContextType } from "payload/dist/admin/components/utilities/DocumentInfo/types";
import { formatDate } from "payload/dist/admin/utilities/formatDate";
import React, { MouseEvent as ReactMouseEvent, RefObject, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { match } from "ts-pattern";
import { PreviewUrlFn } from "../../types/previewUrl";
import { GenDocConfig, generateDocument } from "../../utils/generateDocument";
import { useFields } from "./useFields";
import { useOnFieldChanges } from "./useOnFieldChanges";
import { useOnPreviewMessage } from "./useOnPreviewMessage";
import { useResizeObserver } from "./useResizeObserver";

interface Config {
    previewUrl: PreviewUrlFn;
    showPreview?: boolean;
}

type ScreenSize = {
    slug: string,
    label: string,
    width: number | string,
    height: number | string, 
}

const SCREEN_SIZES: ScreenSize[] = [
    {
        slug: "responsive",
        label: "Responsive",
        width: "100%",
        height: "100%",
    },
    {
        slug: "desktop",
        label: "Desktop",
        width: 1440,
        height: 900,
    },
    {
        slug: "tablet",
        label: "Tablet",
        width: 1024,
        height: 768,
    },
    {
        slug: "smartphone",
        label: "Smartphone",
        width: 375,
        height: 700,
    },
];

const updatePreview = async (genDocConfig: GenDocConfig, fields: Fields, iframe: HTMLIFrameElement, previewWindow: Window | null) => {
    try {
        const doc = await generateDocument(genDocConfig, fields);

        iframe.contentWindow?.postMessage({ cmsLivePreviewData: doc }, "*");
        previewWindow?.postMessage({ cmsLivePreviewData: doc }, "*");
    } catch (e) {
        console.error(e);
    }
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
    const livePreviewContainer = useRef<HTMLDivElement>(null);
    const previewWindow = useRef<Window | null>(null);

    const sizeMenu = useRef<HTMLDivElement | null>(null);
    const scaleMenu = useRef<HTMLDivElement | null>(null);

    const sizeSelect = useRef<HTMLDivElement | null>(null);
    const scaleSelect = useRef<HTMLDivElement | null>(null);

    const [previewSizeDisplay, setPreviewSizeDisplay] = useState("");
    const [selectedSizeItem, setSelectedSizeItem] = useState<ScreenSize>(SCREEN_SIZES[0]);
    const [selectedScale, setSelectedScale] = useState<number>(100);

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
            .exhaustive();
    });

    useResizeObserver(resizeContainer, ([entry]) => {
        const scalePercent = entry.target.querySelector("iframe")?.getAttribute("data-scale");
        const scalePercentNumber = (scalePercent) ? parseFloat(scalePercent) : 100;
        calculateSizeDisplay(entry.contentRect.width, entry.contentRect.height, scalePercentNumber)
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

    const toggleMenu = (selectMenu: RefObject<HTMLDivElement>) => () => {
        if(selectMenu.current) {
            const menuList = selectMenu.current.querySelector('.menu')
            if(menuList) {

                if(selectMenu.current.classList.contains("expanded")) {
                    selectMenu.current.classList.remove("expanded");
                    menuList.setAttribute("style", `height: 0px`)
                } else {
                    selectMenu.current.classList.add("expanded");
                    menuList.setAttribute("style", `height: ${menuList.scrollHeight}px`)
                }

            }
  
        }
    };

    const selectIframeSizeMenu = (item: ScreenSize) => () => {

        let scaleToUse = 100;
        const useItem = {...item}

        if(livePreviewContainer.current && typeof useItem.width === "number" && typeof useItem.height === "number") {

            // check if size fits in viewport
            const elemStyles = getComputedStyle(livePreviewContainer.current)

            const availWidth = livePreviewContainer.current.clientWidth - parseFloat(elemStyles.paddingLeft) - parseFloat(elemStyles.paddingRight);
            const availHeight = livePreviewContainer.current.clientHeight - parseFloat(elemStyles.paddingTop) - parseFloat(elemStyles.paddingBottom);

            const origWidth = useItem.width;
            const origHeight = useItem.height;
            // console.log('ORIG', `${availWidth}x${availHeight}`, `${origWidth}x${origHeight}`)


            if( useItem.width > availWidth || useItem.height > availHeight ) {
                // console.log('too large', `${availWidth}x${availHeight}`, `${useItem.width}x${useItem.height}`)
                scaleToUse = 75;
                useItem.width = origWidth * (scaleToUse / 100);
                useItem.height = origHeight * (scaleToUse / 100);

                if( useItem.width > availWidth || useItem.height > availHeight ) {
                    // console.log('STILL too large', `${availWidth}x${availHeight}`, `${useItem.width}x${useItem.height}`)
                    scaleToUse = 50;
                    useItem.width = origWidth * (scaleToUse / 100);
                    useItem.height = origHeight * (scaleToUse / 100);

                    if( useItem.width > availWidth || useItem.height > availHeight ) {
                        // console.log('STILL STILL too large', `${availWidth}x${availHeight}`, `${useItem.width}x${useItem.height}`)
                        scaleToUse = 25;
                        useItem.width = origWidth * (scaleToUse / 100);
                        useItem.height = origHeight * (scaleToUse / 100);
                    }

                }

            }

        }

        setSelectedSizeItem(useItem)
        setSelectedScale(scaleToUse)

        sizeSelect.current?.classList.remove("expanded");
        sizeSelect.current?.querySelector('.menu')?.setAttribute("style", `height: 0px`)
        changeIframeSize(useItem)


    }

    const selectIframeScaleMenu = (scale: number) => () => {

        if(resizeContainer.current) {

            const scaleFactor = selectedScale / scale;
            // console.log('prev scale', selectedScale, scale, scaleFactor)

            const width = resizeContainer.current?.offsetWidth / scaleFactor;
            const height = resizeContainer.current?.offsetHeight / scaleFactor;
            
            resizeContainer.current!.setAttribute("style", `width:${width}px; height:${height}px;`);
            calculateSizeDisplay(width, height, scale)

            scaleSelect.current?.classList.remove("expanded");
            scaleSelect.current?.querySelector('.menu')?.setAttribute("style", `height: 0px`)

            setSelectedScale(scale)

        }


    }

    const changeIframeSize = (item: ScreenSize) => {
        let params: any = {}
        if(typeof item.width === 'string' && typeof item.height === 'string') {
            params = {
                width: item.width,
                height: item.height,
            }
        } else {
            params = {
                width: `${item.width}px`,
                height: `${item.height}px`,
            }
        }
        resizeContainer.current!.setAttribute("style", `width:${params.width}; height:${params.height};`);
    };

    const calculateSizeDisplay = (width: number, height: number, scalePercent: number) => {
        const scaleFactor = scalePercent / 100;
        const finalWidth = width / scaleFactor;
        const finalHeight = height / scaleFactor;
        setPreviewSizeDisplay(`${String(Math.round(finalWidth))} x ${String(Math.round(finalHeight))}`);
    }

    const rotatePreview = () => {
        if(resizeContainer.current) {
            console.log('rotate', selectedSizeItem);
            // get current dimensions
            const newWidth = resizeContainer.current?.offsetWidth;
            const newHeight = resizeContainer.current?.offsetHeight;
    
            const newItem: ScreenSize = {
                slug: selectedSizeItem.slug,
                label: selectedSizeItem.label,
                width: newHeight,
                height: newWidth,
            }
            changeIframeSize(newItem)
        }
    }

    return (
        <>
            <button className="toggleVisualEditor menu pill pill--has-action" type="button" onClick={togglePreview}>
                <Edit /> Live Preview
            </button>

            <div className="ContentEditor">
                <div className="live-preview-container">
                    <div className="sidebar-drag-handle" onMouseDown={sidebarDragStart}></div>
                    <div ref={livePreviewContainer} className="live-preview">
                        <div ref={resizeContainer} className={`live-preview-resize-container ${(selectedSizeItem.slug == "responsive") ? 'responsive' : ''}`}>
                            <div className="live-preview-settings">
                                <div ref={sizeSelect} className="selectMenu sizeSelect">
                                    <button className="selected" type="button" onClick={toggleMenu(sizeSelect)}>
                                        <span>{selectedSizeItem.label}</span>
                                        <span className="icon"><Chevron /></span>
                                    </button>
                                    <div ref={sizeMenu} className="menu">
                                        <ul>
                                            { SCREEN_SIZES.map( item => (
                                                <li><button type="button" onClick={selectIframeSizeMenu(item)}>{item.label}</button></li>
                                            )) }
                                        </ul>
                                    </div>
                                </div>

                                <div ref={scaleSelect} className="selectMenu sizeSelect">
                                    <button className="selected" type="button" onClick={toggleMenu(scaleSelect)}>
                                        <span>{String(selectedScale)}%</span>
                                        <span className="icon"><Chevron /></span>
                                    </button>
                                    <div ref={scaleMenu} className="menu">
                                        <ul>
                                            <li><button type="button" onClick={selectIframeScaleMenu(100)}>100%</button></li>
                                            <li><button type="button" onClick={selectIframeScaleMenu(75)}>75%</button></li>
                                            <li><button type="button" onClick={selectIframeScaleMenu(50)}>50%</button></li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="rotate">
                                    <button type="button" onClick={rotatePreview}>
                                        <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
                                            <path d="M17 9a1 1 0 0 0-1 1 6.994 6.994 0 0 1-11.89 5H7a1 1 0 0 0 0-2H2.236a1 1 0 0 0-.585.07c-.019.007-.037.011-.055.018-.018.007-.028.006-.04.014-.028.015-.044.042-.069.06A.984.984 0 0 0 1 14v5a1 1 0 1 0 2 0v-2.32A8.977 8.977 0 0 0 18 10a1 1 0 0 0-1-1ZM2 10a6.994 6.994 0 0 1 11.89-5H11a1 1 0 0 0 0 2h4.768a.992.992 0 0 0 .581-.07c.019-.007.037-.011.055-.018.018-.007.027-.006.04-.014.028-.015.044-.042.07-.06A.985.985 0 0 0 17 6V1a1 1 0 1 0-2 0v2.32A8.977 8.977 0 0 0 0 10a1 1 0 1 0 2 0Z"/>
                                        </svg>
                                    </button>
                                </div>

                                <div className="size-display">
                                    {previewSizeDisplay}
                                </div>

                                <div className="elemsRight">
                                    <button className="iconButton openInWindow" type="button" onClick={openPreviewWindow}>
                                        <RelationShip />
                                    </button>
                                    <button className="iconButton toggleVisualEditor" type="button" onClick={togglePreview}>
                                        <CloseMenu />
                                    </button>
                                </div>
                            </div>

                            <iframe
                                id="live-preview-iframe"
                                ref={iframe}
                                src={previewUrl}
                                data-scale={selectedScale}
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
