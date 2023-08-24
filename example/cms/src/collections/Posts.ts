import { CollectionConfig } from "payload/types";
import { Categories } from "./Categories";
import { Tags } from "./Tags";

export const Posts: CollectionConfig = {
    slug: "posts",
    admin: {
        useAsTitle: "title",
        preview: (doc, { locale }) => {
            return `https://bigbird.com/preview/`;
        },
    },
    versions: {
        drafts: true,
    },
    fields: [
        {
            type: "tabs",
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
                            name: "category",
                            type: "relationship",
                            relationTo: Categories.slug,
                            hasMany: false,
                        },
                        {
                            name: "tagsAndCategories",
                            type: "relationship",
                            relationTo: [Tags.slug, Categories.slug],
                            hasMany: true,
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
                position: "sidebar",
            },
        },
    ],
};
