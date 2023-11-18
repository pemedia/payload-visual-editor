import { useEffect } from "react";
import { PreviewToPayloadMessage } from "../../../types/message";

export const useOnPreviewMessage = (previewUrl: string, callback: (message: PreviewToPayloadMessage) => any) => {
    useEffect(() => {
        const listener = (e: MessageEvent) => {
            const url = new URL(previewUrl);

            if (e.origin === url.origin) {
                callback(e.data);
            }
        };

        window.addEventListener("message", listener);

        return () => {
            window.removeEventListener("message", listener);
        };
    }, []);
};
