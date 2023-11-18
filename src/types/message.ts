export type PayloadToPreviewMessage =
    | { livePreviewEvent: "update"; doc: any; }
    | { livePreviewEvent: "focus"; fieldName: string; }

export type PreviewToPayloadMessage =
    | { livePreviewEvent: "ready"; }
    | { livePreviewEvent: "focus"; fieldName: string; }
