export type PayloadToPreviewMessage =
    | { livePreviewEvent: "update", doc: any; }
    | { livePreviewEvent: "focus", fieldName: string; };
