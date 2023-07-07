import { Post, Tag, Category } from "./payload-types";

new EventSource("/esbuild").addEventListener("change", () => location.reload())

const subtitleContainer = document.getElementById("subtitle")!;
const categoryContainer = document.getElementById("category")!;
const tagsContainer = document.getElementById("tags")!;

const isCategory = (doc: any): doc is Category => {
    return doc.name !== undefined;
};

const isTag = (doc: any): doc is Tag => {
    return doc.name !== undefined;
};

window.addEventListener("message", event => {
    const data: Post | undefined = event.data.cmsLivePreviewData;

    if (data) {
        subtitleContainer.innerText = data.subtitle;

        if(data.tags !== undefined) {
            tagsContainer.innerHTML = data.tags.map(tag => {
                if (isTag(tag)) {
                    return `<li>${tag.name}</li>`;
                }
            }).join("\n");
        } 

        if(data.category !== undefined && isCategory(data.category))  categoryContainer.innerHTML = data.category.name
        else categoryContainer.innerHTML = ''
    }
});
