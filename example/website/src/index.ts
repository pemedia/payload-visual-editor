import { Post, Tag, Category } from "./payload-types";

new EventSource("/esbuild").addEventListener("change", () => location.reload())

const titleContainer = document.getElementById("title")!;
const subtitleContainer = document.getElementById("subtitle")!;
const categoryContainer = document.getElementById("category")!;
const tagsAndCategoriesContainer = document.getElementById("tagsAndCategories")!;

const isCategory = (doc: any): doc is Category => {
    return doc.name !== undefined;
};

const isTag = (doc: any): doc is Tag => {
    return doc.name !== undefined;
};

window.addEventListener("message", event => {
    const data: Post | undefined = event.data.cmsLivePreviewData;

    if (data) {
        titleContainer.innerText = data.title;
        subtitleContainer.innerText = data.subtitle;

        if(data.tagsAndCategories !== undefined) {
            tagsAndCategoriesContainer.innerHTML = data.tagsAndCategories.map(tagOrCategory => {
                if (tagOrCategory.relationTo === "tags" && isTag(tagOrCategory.value)) {
                    return `<li>Tag: ${tagOrCategory.value.name}</li>`;
                }

                if (tagOrCategory.relationTo === "categories" && isCategory(tagOrCategory.value)) {
                    return `<li>Category: ${tagOrCategory.value.name}</li>`;
                }

                return null;
            }).filter(Boolean).join("\n");
        } 

        if (data.category !== undefined && isCategory(data.category)) {
            categoryContainer.innerHTML = data.category.name;
        }
    }
});
