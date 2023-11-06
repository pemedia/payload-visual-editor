import { useEffect, useRef } from "react";
import { PreviewMode } from "../../../types/previewMode";
import { PreviewUrlFn } from "../../../types/previewUrl";
import { usePreview } from "../hooks/usePreview";

interface Props {
    previewUrlFn: PreviewUrlFn;

    setPreviewMode: (mode: PreviewMode) => void;
}

export const PopupPreview = (props: Props) => {
    const previewWindow = useRef<Window | null>(null);

    const previewUrl = usePreview(props.previewUrlFn, previewWindow);

    useEffect(() => {
        previewWindow.current = open(previewUrl, "preview", "popup");

        let timer: NodeJS.Timer | undefined;

        if (previewWindow.current) {
            timer = setInterval(() => {
                if (previewWindow.current!.closed) {
                    clearInterval(timer);

                    props.setPreviewMode("none");

                    previewWindow.current = null;
                }
            }, 1000);
        }

        return () => {
            if (timer) {
                clearInterval(timer);
            }

            if (previewWindow.current) {
                previewWindow.current.close();
            }
        };
    }, []);

    return null;
};
