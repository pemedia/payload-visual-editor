import { useEffect } from "react";

type Message = { type: "ready"; }

export const useOnPreviewMessage = (previewUrl: string, callback: (message: Message) => any) => {
    useEffect(() => {
        const childParentListener = (e: MessageEvent) => {
            const url = new URL(previewUrl);

            if (e.origin === url.origin) {
                callback(e.data);
            }
        };

        window.addEventListener("message", childParentListener);

        return () => {
            window.removeEventListener("message", childParentListener);
        };
    }, []);
};
