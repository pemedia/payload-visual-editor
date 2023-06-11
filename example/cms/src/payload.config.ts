import { buildConfig } from "payload/config";
import path from "path";
import { visualEditor } from "../../../src";
import { Examples } from "./collections/Examples";
import { Users } from "./collections/Users";

export default buildConfig({
    serverURL: "http://localhost:3000",
    admin: {
        user: Users.slug,
        // webpack: config => ({
        //     ...config,
        //     resolve: {
        //         ...config.resolve,
        //         alias: {
        //             ...config.resolve?.alias,
        //             react: path.resolve("../../node_modules/react"),
        //             "react-dom": path.resolve("../../node_modules/react-dom")
        //         },
        //     },
        // }),
    },
    collections: [
        Users,
        Examples,
    ],
    typescript: {
        outputFile: path.resolve(__dirname, "payload-types.ts"),
    },
    graphQL: {
        schemaOutputFile: path.resolve(__dirname, "generated-schema.graphql"),
    },
    plugins: [
        visualEditor({
            collections: ['examples'],
            basePreviewUrl: 'http://localhost:3001/preview',
            previewUrls: [
                {
                    slug: 'examples',
                    url: 'http://localhost:3001/cases/preview'
                }
            ]
        }),
    ],
});
