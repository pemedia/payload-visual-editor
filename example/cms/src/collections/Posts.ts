import { CollectionConfig } from "payload/types";
import { Tags } from "./Tags";

export const Posts: CollectionConfig = {
    slug: "posts",
    fields: [
        {
            type: 'tabs',
            tabs: [
                {
                label: 'General',
                fields: [
                    {
                        name: "title",
                        type: "text",
                        required: true,
                    },
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
                ]
            }]
        },
        {
            name: "description",
            type: "text",
            admin: {
                position: 'sidebar'
            }
        },
        
    ],
};
