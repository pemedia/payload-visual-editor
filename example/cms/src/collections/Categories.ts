import { CollectionWithFallbackConfig } from "../../../../src";
import { Category } from "../types/payload-types";

export const Categories:  CollectionWithFallbackConfig<Category> = {
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
    custom: {
        fallback: {
            id: "",
            name: "Fallback Category",
            createdAt: "",
            updatedAt: "",
        },
    },
};
