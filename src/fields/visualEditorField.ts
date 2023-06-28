import { Field } from "payload/types";
import { VisualEditor } from "../components/visualEditor";
import { PreviewUrlFn } from "../types/previewUrl";

interface Config {
    previewUrl: PreviewUrlFn; 
}

export const createVisualEditorField = (config: Config): Field => {
    return {
        name: "visualeditor",
        type: "ui",
        admin: {
            components: {
                Field: VisualEditor({
                    previewUrl: config.previewUrl,
                }),
            },
        },
    };
};
