import { CollectionWithFallbackConfig } from "../../../../src";
import { Tag } from "../types/payload-types";

export const Tags: CollectionWithFallbackConfig<Tag> = {
    slug: "tags",
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
    custom: {
        fallback: {
            id: "",
            name: "Fallback Tag",
            createdAt: "",
            updatedAt: "",
        },
    },
};
