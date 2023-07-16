import { Post, Tag, Category, Media, KitchenSink } from "./payload-types";

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

const isMedia = (doc: any): doc is Media => {
    return doc.filename !== undefined;
};

const isPost = (doc: any): doc is Post => {
    return doc.title !== undefined;
};

const isKitchenSink = (doc: any): doc is KitchenSink => {
    return doc.code !== undefined;
};

window.addEventListener("message", event => {
    const data: Post | KitchenSink | undefined = event.data.cmsLivePreviewData;
    console.log(data);

    clearElements();
    if (isPost(data)) return postPreview(data);
    else if (isKitchenSink(data)) return kitchenSinkPreview(data);
});

const postPreview = (data: Post) => {

    addElem(`<h2>${data.title}</h2>`);
    addElem(`<h3>${data.subtitle}</h3>`);

    if(data.tagsAndCategories !== undefined) {

        const tagList = data.tagsAndCategories.map(tagOrCategory => {
            if (tagOrCategory.relationTo === "tags" && isTag(tagOrCategory.value)) {
                return `<li>Tag: ${tagOrCategory.value.name}</li>`;
            }

            if (tagOrCategory.relationTo === "categories" && isCategory(tagOrCategory.value)) {
                return `<li>Category: ${tagOrCategory.value.name}</li>`;
            }

            return null;

        }).filter(Boolean).join("\n");

        addElem(`<ul>${tagList}</ul>`);
    } 

    if (data.category !== undefined && isCategory(data.category)) {
        addElem(`<div>${data.category.name}</div>`);
    }

}


const kitchenSinkPreview = (data: KitchenSink) => {

    // array
    const array = data.array.map(item => {
        return `<li>Number: ${item.text} – Number: ${item.number}</li>`;
    }).filter(Boolean).join("\n");
    addElem(`<h3>Array:</h3>`);
    addElem(`<ul>${array}</ul>`);

    // blocks
    const blocks = data.blocks.map(item => {
        if(item.blockType == 'testBlock1') return `<li>BlockType1:  ${item.text1} - ${item.text2}</li>`;
        else if (item.blockType == 'testBlock2') return `<li>BlockType2:  ${item.number1} - ${item.number2}</li>`;
    }).filter(Boolean).join("\n");
    addElem(`<h3>Blocks:</h3>`);
    addElem(`<ul>${blocks}</ul>`);
    addElem(`<hr />`);

    // checkbox
    addElem(`<h3>Checkbox:</h3>`);
    addElem(`<div><input type="checkbox" ${(data.checkbox) ? 'checked' : ''} /></div>`);
    addElem(`<hr />`);

    // code
    addElem(`<h3>Code:</h3>`);
    addElem(`<code>${data.code}</code>`);
    addElem(`<hr />`);

    // date
    addElem(`<h3>Date:</h3>`);
    addElem(`<div>${data.date}</div>`);
    addElem(`<hr />`);

    // email
    addElem(`<h3>Email:</h3>`);
    addElem(`<div>${data.email}</div>`);
    addElem(`<hr />`);

    // group
    addElem(`<h3>Group:</h3>`);
    addElem(`<div>${data.group?.number}</div>`);
    addElem(`<div>${data.group?.text}</div>`);
    addElem(`<hr />`);

    // json
    addElem(`<h3>JSON:</h3>`);
    addElem(`<code>${ JSON.stringify(data.json) }</code>`);
    addElem(`<hr />`);

    // number
    addElem(`<h3>Number:</h3>`);
    addElem(`<div>${data.number}</div>`);
    addElem(`<hr />`);

    // point
    addElem(`<h3>Point:</h3>`);
    const points = data.point.map((item, index) => {
        return `<li>[${index}] = ${item}</li>`;
    }).filter(Boolean).join("\n");
    addElem(`<ul>${points}</ul>`);
    addElem(`<hr />`);

    // radio
    addElem(`<h3>Radio:</h3>`);
    addElem(`<div>${data.radio}</div>`);
    addElem(`<hr />`);

    // relationship (single)
    addElem(`<h3>Relationship 1 (single):</h3>`);
    if(isTag(data.relationship1)) {
        addElem(`<ul><li>${data.relationship1.name}</li></ul>`);
    }
    addElem(`<hr />`);

    // relationship (multi)
    addElem(`<h3>Relationship 2 (multi):</h3>`);
    const relationships2 = data.relationship2.map((item, index) => {
        if(isTag(item)) return `<li>[${index}] = ${item.name}</li>`;
        return null;
    }).filter(Boolean).join("\n");
    addElem(`<ul>${relationships2}</ul>`);
    addElem(`<hr />`);

    // relationship (array)
    addElem(`<h3>Relationship 3 (array):</h3>`);
    if(isCategory(data.relationship3.value)) {
        addElem(`<ul><li>${data.relationship3.relationTo}: ${data.relationship3.value.name}</li></ul>`);
    }
    addElem(`<hr />`);

    // relationship (array multi)
    addElem(`<h3>Relationship 4 (array multi):</h3>`);
    const relationships4 = data.relationship4.map((item, index) => {
        if(isTag(item.value) || isCategory(item.value)) {
            return `<li>${item.relationTo}: ${item.value.name}</li>`;
        }
        return null;
    }).filter(Boolean).join("\n");
    addElem(`<ul>${relationships4}</ul>`);
    addElem(`<hr />`);

    // rich text
    addElem(`<h3>Rich text:</h3>`);
    addElem(`<code>${ JSON.stringify([data.richText]) }</code>`);
    addElem(`<hr />`);

    // select 1
    addElem(`<h3>Select 1 (single):</h3>`);
    addElem(`<ul><li>${data.select1}</li></ul>`);
    addElem(`<hr />`);

    // select 2
    addElem(`<h3>Select 2 (multi):</h3>`);
    const selects = data.select2.map((item, index) => {
        return `<li>[${index}] = ${item}</li>`;
    }).filter(Boolean).join("\n");
    addElem(`<ul>${selects}</ul>`);    
    addElem(`<hr />`);

    // text
    addElem(`<h3>Text:</h3>`);
    addElem(`<div>${data.text}</div>`);
    addElem(`<hr />`);

    // textarea
    addElem(`<h3>Textarea:</h3>`);
    addElem(`<div>${data.textarea.replace(/(?:\r\n|\r|\n)/g, "<br>")}</div>`);
    addElem(`<hr />`);

    // upload
    addElem(`<h3>Upload:</h3>`);
    if(isMedia(data.upload)) {
        let mediaElem: string | null = null;
        if(data.upload.mimeType?.includes("image/")) mediaElem = `<img src="${data.upload.url}" width="50%" />`
        else if(data.upload.mimeType?.includes("video/")) mediaElem = `<video width="100%" controls><source src="${data.upload.url}" type="${data.upload.mimeType}"></video>`
        addElem(`<div>
            <div>${data.upload.filename}</div>
           ${(mediaElem) ? `<div>${mediaElem}</div>` : '' }
        </div>`);
    }
    addElem(`<hr />`);

}


const addElem = (data: string) => {
    const container = document.getElementById("preview");
    const template = document.createElement('template');
    data = data.trim();
    template.innerHTML = data;
    const htmlNode = template.content.firstChild;
    if(container && htmlNode) container.appendChild(htmlNode);
}

const clearElements = () => {
    const container = document.getElementById("preview");
    if(container) container.innerHTML = "";
}