import { CollectionWithFallbackConfig } from "../../../../src";
import { Medium } from "../types/payload-types";

export const Media: CollectionWithFallbackConfig<Medium> = {
    slug: "media",
    typescript: {
        interface: "Medium",
    },
    fields: [],
    upload: {
        staticDir: "media",
    //     adminThumbnail: "thumbnail",
    //     imageSizes: [
    //         {
    //             height: 200,
    //             width: 200,
    //             crop: "center",
    //             name: "thumbnail",
    //             formatOptions: {
    //                 format: "webp",
    //             },
    //         },
    //         {
    //             width: 540,
    //             height: 960,
    //             crop: "center",
    //             name: "mobile",
    //             formatOptions: {
    //                 format: "webp",
    //             },
    //         },
    //         {
    //             width: 1707,
    //             height: 960,
    //             crop: "center",
    //             name: "desktop",
    //             formatOptions: {
    //                 format: "webp",
    //             },
    //         },
    //     ],
    },
    custom: {
        fallback: {
            id: "",
            createdAt: "",
            updatedAt: "",
            mimeType: "image/jpeg",
            url: "https://fastly.picsum.photos/id/1038/200/200.jpg?hmac=H5HUzcu1mnVoapNKQB4L0bitWDrUhwiYuke8QItf9ng",
            filename: "lorem picsum",
        },
    },
};
