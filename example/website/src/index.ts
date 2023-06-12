import { Post, Tag } from "./payload-types";

const subtitleContainer = document.getElementById("subtitle")!;
const tagsContainer = document.getElementById("tags")!;

const isTag = (doc: any): doc is Tag => {
    return doc.name !== undefined;
};

window.addEventListener("message", event => {
    const data: Post | undefined = event.data.cmsLivePreviewData;

    if (data) {
        subtitleContainer.innerText = data.subtitle;

        tagsContainer.innerHTML = data.tags.map(tag => {
            if (isTag(tag)) {
                return `<li>${tag.name}</li>`;
            }
        }).join("\n");
    }
});
