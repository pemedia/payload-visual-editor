import { CollectionConfig } from "payload/types";

export const Media: CollectionConfig = {
    slug: "media",
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
};
