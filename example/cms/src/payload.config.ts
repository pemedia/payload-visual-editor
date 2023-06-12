import path from "path";
import { buildConfig } from "payload/config";
import { visualEditor } from "../../../src";
import { Posts } from "./collections/Posts";
import { Tags } from "./collections/Tags";
import { Users } from "./collections/Users";

export default buildConfig({
    serverURL: "http://localhost:3000",
    admin: {
        user: Users.slug,
        webpack: config => ({
            ...config,
            resolve: {
                ...config.resolve,
                alias: {
                    ...config.resolve?.alias,
                    "react": path.join(__dirname, "../../../node_modules/react"),
                    "react-dom": path.join(__dirname, "../../../node_modules/react-dom"),
                    "payload": path.join(__dirname, "../../../node_modules/payload"),
                },
            },
        }),
    },
    collections: [
        Users,
        Posts,
        Tags,
    ],
    typescript: {
        outputFile: path.resolve(__dirname, "../../website/src/payload-types.ts"),
    },
    graphQL: {
        schemaOutputFile: path.resolve(__dirname, "generated-schema.graphql"),
    },
    plugins: [
        visualEditor({
            previewUrl: "http://localhost:8080",
            collections: {
                [Posts.slug]: {},
            },
        }),
    ],
});
