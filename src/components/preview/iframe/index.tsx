import { ExternalLinkIcon } from "payload/dist/admin/components/graphics/ExternalLink";
import CloseMenu from "payload/dist/admin/components/icons/CloseMenu";
import React, { RefObject, useRef, useState } from "react";
import { PreviewMode } from "../../../types/previewMode";
import { PreviewUrlFn } from "../../../types/previewUrl";
import { usePreview } from "../hooks/usePreview";
import { useResizeObserver } from "./useResizeObserver";
import Chevron from "payload/dist/admin/components/icons/Chevron";

interface Props {
    previewUrlFn: PreviewUrlFn;
    setPreviewMode: (mode: PreviewMode) => void;
}

interface ScreenSize {
    slug: string;
    label: string;
    width: number | string;
    height: number | string;
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

export const IFramePreview = (props: Props) => {

    const iframe = useRef<HTMLIFrameElement>(null);
    const resizeContainer = useRef<HTMLDivElement>(null);
    const livePreviewContainer = useRef<HTMLDivElement>(null);

    const sizeMenu = useRef<HTMLDivElement | null>(null);
    const scaleMenu = useRef<HTMLDivElement | null>(null);

    const sizeSelect = useRef<HTMLDivElement | null>(null);
    const scaleSelect = useRef<HTMLDivElement | null>(null);

    const [previewSizeDisplay, setPreviewSizeDisplay] = useState("");
    const [selectedSizeItem, setSelectedSizeItem] = useState<ScreenSize>(SCREEN_SIZES[0]);
    const [selectedScale, setSelectedScale] = useState<number>(100);

    const previewUrl = usePreview(props.previewUrlFn, iframe);

    useResizeObserver(resizeContainer, ([entry]) => {
        const scalePercent = entry.target.querySelector("iframe")?.getAttribute("data-scale");
        const scalePercentNumber = (scalePercent) ? parseFloat(scalePercent) : 100;
        calculateSizeDisplay(entry.contentRect.width, entry.contentRect.height, scalePercentNumber)
    });

    const toggleMenu = (selectMenu: RefObject<HTMLDivElement>) => () => {
        if (selectMenu.current) {
            const menuList = selectMenu.current.querySelector('.menu')
            if (menuList) {

                if (selectMenu.current.classList.contains("expanded")) {
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
        const useItem = { ...item }

        if (livePreviewContainer.current && typeof useItem.width === "number" && typeof useItem.height === "number") {

            // check if size fits in viewport
            const elemStyles = getComputedStyle(livePreviewContainer.current)

            const availWidth = livePreviewContainer.current.clientWidth - parseFloat(elemStyles.paddingLeft) - parseFloat(elemStyles.paddingRight);
            const availHeight = livePreviewContainer.current.clientHeight - parseFloat(elemStyles.paddingTop) - parseFloat(elemStyles.paddingBottom);

            const origWidth = useItem.width;
            const origHeight = useItem.height;

            if (useItem.width > availWidth || useItem.height > availHeight) {
                // console.log('too large', `${availWidth}x${availHeight}`, `${useItem.width}x${useItem.height}`)
                scaleToUse = 75;
                useItem.width = origWidth * (scaleToUse / 100);
                useItem.height = origHeight * (scaleToUse / 100);

                if (useItem.width > availWidth || useItem.height > availHeight) {
                    // console.log('STILL too large', `${availWidth}x${availHeight}`, `${useItem.width}x${useItem.height}`)
                    scaleToUse = 50;
                    useItem.width = origWidth * (scaleToUse / 100);
                    useItem.height = origHeight * (scaleToUse / 100);

                    if (useItem.width > availWidth || useItem.height > availHeight) {
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

        if (resizeContainer.current) {

            const scaleFactor = selectedScale / scale;
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
        if (typeof item.width === 'string' && typeof item.height === 'string') {
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
        if (resizeContainer.current) {
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
        <div ref={livePreviewContainer} className="live-preview-container">
            <div ref={resizeContainer} className={`live-preview-resize-container ${(selectedSizeItem.slug == "responsive") ? 'responsive' : ''}`}>
                <div className="live-preview-settings">
                    <div ref={sizeSelect} className="selectMenu sizeSelect">
                        <button className="selected" type="button" onClick={toggleMenu(sizeSelect)}>
                            <span>{selectedSizeItem.label}</span>
                            <span className="icon"><Chevron /></span>
                        </button>
                        <div ref={sizeMenu} className="menu">
                            <ul>
                                {SCREEN_SIZES.map(item => (
                                    <li><button type="button" onClick={selectIframeSizeMenu(item)}>{item.label}</button></li>
                                ))}
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
                                <path d="M17 9a1 1 0 0 0-1 1 6.994 6.994 0 0 1-11.89 5H7a1 1 0 0 0 0-2H2.236a1 1 0 0 0-.585.07c-.019.007-.037.011-.055.018-.018.007-.028.006-.04.014-.028.015-.044.042-.069.06A.984.984 0 0 0 1 14v5a1 1 0 1 0 2 0v-2.32A8.977 8.977 0 0 0 18 10a1 1 0 0 0-1-1ZM2 10a6.994 6.994 0 0 1 11.89-5H11a1 1 0 0 0 0 2h4.768a.992.992 0 0 0 .581-.07c.019-.007.037-.011.055-.018.018-.007.027-.006.04-.014.028-.015.044-.042.07-.06A.985.985 0 0 0 17 6V1a1 1 0 1 0-2 0v2.32A8.977 8.977 0 0 0 0 10a1 1 0 1 0 2 0Z" />
                            </svg>
                        </button>
                    </div>

                    <div className="size-display">
                        {previewSizeDisplay}
                    </div>

                    <div className="elemsRight">
                        <button className="iconButton openInWindow" type="button" onClick={() => props.setPreviewMode("popup")}>
                            <ExternalLinkIcon />
                        </button>
                        <button className="iconButton closeVisualEditor" type="button" onClick={() => props.setPreviewMode("none")}>
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
