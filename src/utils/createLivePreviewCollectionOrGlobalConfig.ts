import { LivePreviewCollectionOrGlobalConfig } from "../types/livePreviewCollectionOrGlobalConfig";

export const createLivewPreviewCollectionOrGlobalConfig = <T>(config: LivePreviewCollectionOrGlobalConfig<T>) => ({
    livePreview: config,
});
