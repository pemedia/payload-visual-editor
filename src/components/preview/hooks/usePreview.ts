import { useConfig, useDocumentInfo, useLocale } from "payload/components/utilities";
import { ContextType } from "payload/dist/admin/components/utilities/DocumentInfo/types";
import { Fields } from "payload/types";
import { RefObject } from "react";
import { match } from "ts-pattern";
import { PreviewUrlFn } from "../../../types/previewUrl";
import { GenDocConfig, generateDocument } from "../../../utils/generateDocument";
import { postMessage } from "../../../utils/postMessage";
import { useFields } from "./useFields";
import { useInputs } from "./useInputs";
import { useOnFieldChanges } from "./useOnFieldChanges";
import { useOnInputFocus } from "./useOnInputFocus";
import { useOnPreviewMessage } from "./useOnPreviewMessage";

const getFieldConfigs = (documentInfo: ContextType) => {
    return documentInfo.collection?.fields ?? documentInfo.global?.fields ?? [];
};

const updatePreview = async (genDocConfig: GenDocConfig, fields: Fields, windowRef: RefObject<HTMLIFrameElement | Window>) => {
    try {
        const doc = await generateDocument(genDocConfig, fields);

        postMessage(windowRef, { livePreviewEvent: "update", doc });
    } catch (e) {
        console.error(e);
    }
};

const focusInput = (fieldName: string, inputs: Map<string, HTMLInputElement | HTMLTextAreaElement>) => {
    const input = inputs.get(fieldName);

    if (!input) {
        return;
    }

    input.select?.();

    // NOTE: don't use scrollIntoView, because it would also scroll the preview
    const y = input.getBoundingClientRect().top + window.scrollY - 300;

    window.scrollTo({ top: y, behavior: "smooth" });
};

export const usePreview = (previewUrlFn: PreviewUrlFn, windowRef: RefObject<HTMLIFrameElement | Window>) => {
    const payloadConfig = useConfig();
    const documentInfo = useDocumentInfo();
    const fieldConfigs = getFieldConfigs(documentInfo);
    const fields = useFields();
    const locale = useLocale();
    const inputs = useInputs(fields.current);

    const genDocConfig: GenDocConfig = {
        collections: payloadConfig.collections,
        globals: payloadConfig.globals,
        fieldConfigs,
        serverUrl: payloadConfig.serverURL,
        apiPath: payloadConfig.routes.api,
    };

    const previewUrl = payloadConfig.localization
        ? previewUrlFn({ locale: locale.code })
        : previewUrlFn({ locale: "" });

    useOnPreviewMessage(previewUrl, message => {
        match(message)
            .with({ livePreviewEvent: "ready" }, () => updatePreview(genDocConfig, fields.current, windowRef))
            .with({ livePreviewEvent: "focus" }, ({ fieldName }) => focusInput(fieldName, inputs.current))
            .exhaustive();
    });

    useOnFieldChanges(fields.current, () => {
        updatePreview(genDocConfig, fields.current, windowRef);
    });

    useOnInputFocus(inputs.current, fieldName => {
        postMessage(windowRef, { livePreviewEvent: "focus", fieldName });
    });

    return previewUrl;
};
