import { CollectionConfig } from "payload/types";
import { VisualEditor } from "../components/visualEditor";

export const visualEditorField: any = (collection: CollectionConfig) => {
    // const hasSpecialUrl = pluginConfig?.previewUrls?.find(e => e.slug === collection.slug);
    return [
        {
            name: "visualeditor",
            type: "ui",
            admin: {
                components: {
                    Field: VisualEditor({
                        getCollectionConfig: () => collection,
                        // previewUrl: (typeof hasSpecialUrl === "undefined") ? pluginConfig.basePreviewUrl : hasSpecialUrl.url,
                        previewUrl: "",
                    }),
                },
            },
        },
    ];
};
