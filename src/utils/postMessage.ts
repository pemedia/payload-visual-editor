import { RefObject } from "react";
import { PayloadToPreviewMessage } from "../types/message";

export const postMessage = (windowRef: RefObject<HTMLIFrameElement | Window>, message: PayloadToPreviewMessage) => {
    if (windowRef.current instanceof HTMLIFrameElement) {
        windowRef.current.contentWindow?.postMessage(message, "*");
    } else {
        windowRef.current?.postMessage(message, "*");
    }
};
