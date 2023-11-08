import { useEffect } from "react";

type Message = "ready"

export const useOnPreviewMessage = (previewUrl: string, callback: (message: Message) => any) => {
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
