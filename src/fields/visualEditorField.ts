import { Field } from "payload/types";
import { VisualEditor } from "../components/visualEditor";

export const createVisualEditorField = (previewUrl: string): Field => {
    return {
        name: "visualeditor",
        type: "ui",
        admin: {
            components: {
                Field: VisualEditor({
                    previewUrl,
                }),
            },
        },
    };
};
