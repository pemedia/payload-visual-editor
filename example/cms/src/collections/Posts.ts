import { CollectionConfig } from "payload/types";
import { Tags } from "./Tags";

export const Posts: CollectionConfig = {
    slug: "posts",
    admin: {
        useAsTitle: "title",
    },
    versions: {
        drafts: true,
    },
    fields: [
        {
            type: 'tabs',
            tabs: [
                {
                    label: "General",
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
                            name: 'status',
                            type: 'select',
                            options: [
                                {
                                    value: 'draft',
                                    label: 'Draft',
                                },
                                {
                                    value: 'published',
                                    label: 'Published',
                                },
                            ],
                            defaultValue: 'draft',
                        },
                    ],
                },
            ],
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
