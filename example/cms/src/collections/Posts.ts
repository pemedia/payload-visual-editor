import { CollectionConfig } from "payload/types";
import { Categories } from "./Categories";
import { Tags } from "./Tags";
import { slateEditor } from "@payloadcms/richtext-slate";

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
                        {
                            name: "checkParagraph",
                            type: "checkbox",
                            defaultValue: false,
                        },
                        {
                            name: 'paragraph',
                            type: 'richText',
                            required: true,
                            editor: slateEditor({
                                admin: {
                                    elements: ['h2', 'h3'],
                                    leaves: ["italic", "underline", "bold"],
                                }
                            }),
                            admin: {
                                condition: (data, siblingData, { user }) => siblingData.checkParagraph,
                            },
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
