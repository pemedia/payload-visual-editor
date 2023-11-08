import Chevron from "payload/dist/admin/components/icons/Chevron";
import CloseMenu from "payload/dist/admin/components/icons/CloseMenu";
import React, { CSSProperties, RefObject, useEffect, useRef, useState } from "react";
import { PreviewMode } from "../../../types/previewMode";
import { PreviewUrlFn } from "../../../types/previewUrl";
import NewWindow from "../../icons/NewWindow";
import { usePreview } from "../hooks/usePreview";
import { useResizeObserver } from "./useResizeObserver";

interface Props {
    previewUrlFn: PreviewUrlFn;
    setPreviewMode: (mode: PreviewMode) => void;
}

interface Size {
    width: number;
    height: number;
}

interface ScreenSize extends Size {
    slug: string;
    label: string;
}

const SCREEN_SIZES: ScreenSize[] = [
    {
        slug: "responsive",
        label: "Responsive",
        width: 0,
        height: 0,
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

const calculateScale = (availableSize: Size, preferredSize: Size, preferredScale = Infinity) => {
    // const scales = [1, 0.75, 0.5];

    // const fittingScale = scales.find(scale => {
    //     if (preferred.width * scale <= available.width && preferred.height * scale <= available.height) {
    //         return scale;
    //     }
    // });

    // return fittingScale || 0.25;

    const scaleX = availableSize.width / preferredSize.width;
    const scaleY = availableSize.height / preferredSize.height;

    // use the smaller scale
    const maxScale = Math.min(scaleX, scaleY, 1);

    // round it
    const rounded = Math.floor(maxScale * 100) / 100;

    // if preferred scale is smaller than max scale, use preferred scale
    return Math.min(rounded, preferredScale);
};

export const IFramePreview = (props: Props) => {
    const iframe = useRef<HTMLIFrameElement>(null);
    const resizeContainer = useRef<HTMLDivElement>(null);
    const livePreviewContainer = useRef<HTMLDivElement>(null);

    const sizeSelect = useRef<HTMLDivElement | null>(null);
    const scaleSelect = useRef<HTMLDivElement | null>(null);

    const [sizeAndScale, setSizeAndScale] = useState({
        ...SCREEN_SIZES[0],
        scale: 1,
    });

    useEffect(() => {
        const availableSize = {
            width: livePreviewContainer.current!.clientWidth,
            height: livePreviewContainer.current!.clientHeight,
        };

        setSizeAndScale({
            ...sizeAndScale,
            ...availableSize,
        });
    }, []);

    useResizeObserver(resizeContainer, ([entry]) => {
        setSizeAndScale(oldValue => ({
            ...oldValue,
            width: entry.contentRect.width / oldValue.scale,
            height: entry.contentRect.height / oldValue.scale,
        }));
    });

    const toggleMenu = (selectMenu: RefObject<HTMLDivElement>) => () => {
        if (selectMenu.current) {
            const menuList = selectMenu.current.querySelector(".menu");

            if (menuList) {
                if (selectMenu.current.classList.contains("expanded")) {
                    selectMenu.current.classList.remove("expanded");
                    menuList.setAttribute("style", `height: 0px`);
                } else {
                    selectMenu.current.classList.add("expanded");
                    menuList.setAttribute("style", `height: ${menuList.scrollHeight}px`);
                }
            }
        }
    };

    const selectIframeSizeMenu = (item: ScreenSize) => () => {
        const availableSize = {
            width: livePreviewContainer.current!.clientWidth,
            height: livePreviewContainer.current!.clientHeight,
        };

        if (item.slug === "responsive") {
            setSizeAndScale({
                ...item,
                ...availableSize,
                scale: 1,
            });
        } else {
            const preferredSize = item;

            const scale = calculateScale(availableSize, preferredSize);

            setSizeAndScale({
                ...preferredSize,
                scale,
            });
        }

        sizeSelect.current?.classList.remove("expanded");
        sizeSelect.current?.querySelector(".menu")?.setAttribute("style", `height: 0px`);
    };

    const selectIframeScaleMenu = (preferredScale: number) => () => {
        const availableSize = {
            width: livePreviewContainer.current!.clientWidth,
            height: livePreviewContainer.current!.clientHeight,
        };

        const preferredSize = sizeAndScale;

        const scale = calculateScale(availableSize, preferredSize, preferredScale);

        setSizeAndScale({
            ...sizeAndScale,
            scale,
        });

        scaleSelect.current?.classList.remove("expanded");
        scaleSelect.current?.querySelector(".menu")?.setAttribute("style", `height: 0px`);
    };

    const rotatePreview = () => {
        const availableSize = {
            width: livePreviewContainer.current!.clientWidth,
            height: livePreviewContainer.current!.clientHeight,
        };

        const preferredSize = {
            width: sizeAndScale.height,
            height: sizeAndScale.width,
        };

        const scale = calculateScale(availableSize, preferredSize);

        setSizeAndScale({
            ...sizeAndScale,
            ...preferredSize,
            scale,
        });
    };

    const previewUrl = usePreview(props.previewUrlFn, iframe);

    const resizeContainerStyles: CSSProperties = {
        width: sizeAndScale.width * sizeAndScale.scale,
        height: sizeAndScale.height * sizeAndScale.scale,
    };

    const iframeStyles: CSSProperties = {
        transform: `scale(${sizeAndScale.scale})`,
        width: `${(1 / sizeAndScale.scale) * 100}%`,
        height: `${(1 / sizeAndScale.scale) * 100}%`,
    };

    return (
        <div ref={livePreviewContainer} className="live-preview-container">
            <div
                ref={resizeContainer}
                className={`live-preview-resize-container ${sizeAndScale.slug}`}
                style={resizeContainerStyles}
            >
                <div className="live-preview-settings">
                    <div ref={sizeSelect} className="selectMenu sizeSelect">
                        <button className="selected" type="button" onClick={toggleMenu(sizeSelect)}>
                            <span>{sizeAndScale.label}</span>
                            <span className="icon"><Chevron /></span>
                        </button>
                        <div className="menu">
                            <ul>
                                {SCREEN_SIZES.map(item => (
                                    <li><button type="button" onClick={selectIframeSizeMenu(item)}>{item.label}</button></li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div ref={scaleSelect} className="selectMenu sizeSelect">
                        <button className="selected" type="button" onClick={toggleMenu(scaleSelect)}>
                            <span>{(sizeAndScale.scale * 100).toFixed()}%</span>
                            <span className="icon"><Chevron /></span>
                        </button>
                        <div className="menu">
                            <ul>
                                <li><button type="button" onClick={selectIframeScaleMenu(1)}>100%</button></li>
                                <li><button type="button" onClick={selectIframeScaleMenu(0.75)}>75%</button></li>
                                <li><button type="button" onClick={selectIframeScaleMenu(0.5)}>50%</button></li>
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
                        {Math.round(sizeAndScale.width)} x {Math.round(sizeAndScale.height)}
                    </div>

                    <div className="elemsRight">
                        <button className="iconButton openInWindow" type="button" onClick={() => props.setPreviewMode("popup")}>
                            <NewWindow />
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
                    style={iframeStyles}
                />
            </div>
        </div>
    );
};
