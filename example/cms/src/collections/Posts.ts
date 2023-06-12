import { CollectionConfig } from "payload/types";
import { Tags } from "./Tags";

export const Posts: CollectionConfig = {
    slug: "posts",
    fields: [
        {
            name: "subtitle",
            type: "text",
            required: true,
        },
        {
            name: "tags",
            type: "relationship",
            relationTo: Tags.slug,
            hasMany: true,
            required: true,
        },
    ],
};
