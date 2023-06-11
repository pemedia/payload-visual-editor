import { CollectionConfig, Field, GlobalConfig } from "payload/types";
import { VisualEditor } from "../components/visualEditor";

export const createVisualEditorField = (collection: CollectionConfig | GlobalConfig): Field => {
    // const hasSpecialUrl = pluginConfig?.previewUrls?.find(e => e.slug === collection.slug);

    return {
        name: "visualeditor",
        type: "ui",
        admin: {
            components: {
                Field: VisualEditor({
                    // previewUrl: (typeof hasSpecialUrl === "undefined") ? pluginConfig.basePreviewUrl : hasSpecialUrl.url,
                    previewUrl: "",
                }),
            },
        },
    };
};
