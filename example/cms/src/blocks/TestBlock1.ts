import { Block } from "payload/types";

export const TestBlock1: Block = {
    slug: "testBlock1",
    fields: [
        { name: "text1", type: "text", required: true },
        { name: "text2", type: "text", required: true },
    ],
};
