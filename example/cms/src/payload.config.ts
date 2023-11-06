import { webpackBundler } from "@payloadcms/bundler-webpack";
import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { buildConfig } from "payload/config";
import { visualEditor } from "../../../src";
import "../../../src/styles.scss";
import { Categories } from "./collections/Categories";
import { Media } from "./collections/Media";
import { Posts } from "./collections/Posts";
import { Tags } from "./collections/Tags";
import { Users } from "./collections/Users";
import { KitchenSink } from "./globals/kitchenSink";

export default buildConfig({
    serverURL: "http://localhost:3000",
    admin: {
        user: Users.slug,
        bundler: webpackBundler(),
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
        Categories,
        Media,
    ],
    globals: [
        KitchenSink,
    ],
    localization: {
        locales: [
            'en',
            'de',
        ],
        defaultLocale: 'de',
        fallback: true,
    },
    db: mongooseAdapter({
        url: process.env.MONGODB_URI!,
    }),
    editor: lexicalEditor({}),
    typescript: {
        outputFile: path.resolve(__dirname, "types/payload-types.ts"),
    },
    graphQL: {
        schemaOutputFile: path.resolve(__dirname, "generated-schema.graphql"),
    },
    plugins: [
        visualEditor({
            previewUrl: () => `http://localhost:8080/`,
            collections: {
                [Posts.slug]: {},
            },
            globals: {
                [KitchenSink.slug]: {},
            },
        }),
    ],
});
