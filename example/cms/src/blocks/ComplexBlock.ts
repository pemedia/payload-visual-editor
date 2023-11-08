import { Block } from "payload/types";
import { Media } from "../collections/Media";

export const ComplexBlock: Block = {
    slug: "complexBlock",
    fields: [
        {
            name: "textPosition",
            type: "select",
            required: true,
            options: [
                { label: "left", value: "left" },
                { label: "right", value: "right" },
            ],
        },
        {
            name: "text",
            type: "richText",
            required: true,
        },
        {
            name: "medium",
            type: "upload",
            relationTo: Media.slug,
            required: true,
        },
    ],
};
