import { CollectionConfig } from "payload/types";

export const Categories: CollectionConfig = {
    slug: "categories",
    admin: {
        useAsTitle: "name",
    },
    fields: [
        {
            name: "name",
            type: "text",
            required: true,
        },
    ],
};
