import { GlobalConfig } from "payload/types";
import { TestBlock1 } from "../blocks/TestBlock1";
import { TestBlock2 } from "../blocks/TestBlock2";
import { Categories } from "../collections/Categories";
import { Media } from "../collections/Media";
import { Tags } from "../collections/Tags";

export const KitchenSink: GlobalConfig = {
    slug: "kitchenSink",
    admin: {
        preview: (doc, { locale }) => {
            return `https://bigbird.com/preview/`;
        },
    },
    fields: [
        {
            name: "array",
            type: "array",
            required: true,
            fields: [
                { name: "text", type: "text" },
                { name: "number", type: "number" },
            ],
        },
        {
            name: "blocks",
            type: "blocks",
            required: true,
            blocks: [TestBlock1, TestBlock2],
        },
        {
            name: "checkbox",
            type: "checkbox",
            required: true,
        },
        {
            name: "code",
            type: "code",
            required: true,
        },
        {
            name: "date",
            type: "date",
            required: true,
        },
        {
            name: "email",
            type: "email",
            required: true,
        },
        {
            name: "group",
            type: "group",
            fields: [
                { name: "text", type: "text" },
                { name: "number", type: "number" },
            ],
        },
        {
            name: "json",
            type: "json",
            required: true,
        },
        {
            name: "number",
            type: "number",
            required: true,
        },
        {
            name: "point",
            type: "point",
            required: true,
        },
        {
            name: "radio",
            type: "radio",
            required: true,
            options: [
                { label: "Radio 1", value: "radio1" },
                { label: "Radio 2", value: "radio2" },
            ],
        },
        {
            name: "relationship1",
            type: "relationship",
            required: true,
            relationTo: Tags.slug,
        },
        {
            name: "relationship2",
            type: "relationship",
            required: true,
            relationTo: Tags.slug,
            hasMany: true,
        },
        {
            name: "relationship3",
            type: "relationship",
            required: true,
            relationTo: [Categories.slug, Tags.slug],
        },
        {
            name: "relationship4",
            type: "relationship",
            required: true,
            relationTo: [Categories.slug, Tags.slug],
            hasMany: true,
        },
        {
            name: "richText",
            type: "richText",
            required: true,
        },
        {
            name: "select1",
            type: "select",
            required: true,
            options: [
                { label: "Select 1", value: "select1" },
                { label: "Select 2", value: "select2" },
            ],
        },
        {
            name: "select2",
            type: "select",
            required: true,
            hasMany: true,
            options: [
                { label: "Select 1", value: "select1" },
                { label: "Select 2", value: "select2" },
            ],
        },
        // {
        //     type: "tabs",
        //     tabs: [
        //         { 
        //             name: "tab1",
        //             fields: [ 
        //                 { name: "text1", type: "text" },
        //             ],
        //         },
        //         { 
        //             name: "tab2",
        //             fields: [ 
        //                 { name: "text1", type: "text" },
        //             ],
        //         },
        //     ],
        // },
        {
            name: "text",
            type: "text",
            required: true,
        },
        {
            name: "textarea",
            type: "textarea",
            required: true,
        },
        {
            name: "upload",
            type: "upload",
            required: true,
            relationTo: Media.slug,
        },
    ],
};
