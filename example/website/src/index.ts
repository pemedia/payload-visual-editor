import { Post, Tag, Category, Medium, KitchenSink } from "./payload-types";

new EventSource("/esbuild").addEventListener("change", () => location.reload())

const isCategory = (doc: any): doc is Category => {
    return doc.name !== undefined;
};

const isTag = (doc: any): doc is Tag => {
    return doc.name !== undefined;
};

const isPost = (doc: any): doc is Post => {
    return doc.title !== undefined;
};

const isKitchenSink = (doc: any): doc is KitchenSink => {
    return doc.code !== undefined;
};

window.addEventListener("message", event => {
    switch (event.data.livePreviewEvent) {
        case "update": {
            const doc: Post | KitchenSink = event.data.doc;

            clearElements();

            if (isPost(doc)) {
                return postPreview(doc);
            } else if (isKitchenSink(doc)) {
                return kitchenSinkPreview(doc);
            }

            break;
        }
        case "focus": {
            // just wait a while, because the update event could happen shortly after the focus event
            // since it creates new elements, it would stop the focus animation
            setTimeout(() => {
                const fieldName = event.data.fieldName;
                const element = document.querySelector(`[data-payload-field-name="${fieldName}"]`);

                if (element) {
                    element.scrollIntoView({ block: "center", behavior: "smooth" });
                    element.classList.add("focus");

                    setTimeout(() => {
                        element.classList.remove("focus");
                    }, 1000);
                }
            }, 100);

            break;
        }
    }
});

window.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        (opener ?? parent).postMessage("ready", "*");
    }, 100);
});

const postPreview = (data: Post) => {

    addElem(`<h2>${data.title}</h2>`, "title");
    addElem(`<h3>${data.subtitle}</h3>`, "subtitle");

    if (data.tagsAndCategories !== undefined) {
        const tagList = data.tagsAndCategories?.map(tagOrCategory => {
            if (tagOrCategory.relationTo === "tags" && isTag(tagOrCategory.value)) {
                return `<li>Tag: ${tagOrCategory.value.name}</li>`;
            }

            if (tagOrCategory.relationTo === "categories" && isCategory(tagOrCategory.value)) {
                return `<li>Category: ${tagOrCategory.value.name}</li>`;
            }

            return null;

        }).filter(Boolean).join("\n");

        addElem(`<ul>${tagList}</ul>`, "tagsAndCategories");
    }

    if (data.category !== undefined && isCategory(data.category)) {
        addElem(`<div>${data.category.name}</div>`, "category");
    }

}


const kitchenSinkPreview = (data: KitchenSink) => {

    // array
    const array = data.array.map(item => {
        return `<li>Number: ${item.text} – Number: ${item.number}</li>`;
    }).filter(Boolean).join("\n");
    addElem(`<h3>Array:</h3>`);
    addElem(`<ul>${array}</ul>`, "array");

    // blocks
    const blocks = data.blocks.map(item => {
        if (item.blockType == 'testBlock1') return `<li>BlockType1:  ${item.text1} - ${item.text2}</li>`;
        else if (item.blockType == 'testBlock2') return `<li>BlockType2:  ${item.number1} - ${item.number2}</li>`;
    }).filter(Boolean).join("\n");
    addElem(`<h3>Blocks:</h3>`);
    addElem(`<ul>${blocks}</ul>`, "blocks");
    addElem(`<hr />`);

    // checkbox
    addElem(`<h3>Checkbox:</h3>`);
    addElem(`<div><input type="checkbox" ${(data.checkbox) ? 'checked' : ''} /></div>`, "checkbox");
    addElem(`<hr />`);

    // code
    addElem(`<h3>Code:</h3>`);
    addElem(`<code>${data.code}</code>`, "code");
    addElem(`<hr />`);

    // date
    addElem(`<h3>Date:</h3>`);
    addElem(`<div>${data.date}</div>`, "date");
    addElem(`<hr />`);

    // email
    addElem(`<h3>Email:</h3>`);
    addElem(`<div>${data.email}</div>`, "email");
    addElem(`<hr />`);

    // group
    addElem(`<h3>Group:</h3>`);
    addElem(`<div>text: ${data.group?.text}</div>`, "group.text");
    addElem(`<div>number: ${data.group?.number}</div>`, "group.number");
    addElem(`<hr />`);

    // json
    addElem(`<h3>JSON:</h3>`);
    addElem(`<code>${JSON.stringify(data.json)}</code>`, "json");
    addElem(`<hr />`);

    // number
    addElem(`<h3>Number:</h3>`);
    addElem(`<div>${data.number}</div>`, "number");
    addElem(`<hr />`);

    // point
    addElem(`<h3>Point:</h3>`);
    addElem(`<div>${ns(data.point[1])}</div>`, "point.latitude");
    addElem(`<div>${ew(data.point[0])}</div>`, "point.longitude");
    addElem(`<hr />`);

    // radio
    addElem(`<h3>Radio:</h3>`);
    addElem(`<div>${data.radio}</div>`, "radio");
    addElem(`<hr />`);

    // relationship (single)
    addElem(`<h3>Relationship 1 (single):</h3>`);
    addElem(`<ul><li>${(data.relationship1 as Tag).name}</li></ul>`, "relationship1");
    addElem(`<hr />`);

    // relationship (multi)
    addElem(`<h3>Relationship 2 (multi):</h3>`);
    const relationships2 = (data.relationship2 as Tag[]).map((item, index) => {
        return `<li>[${index}] = ${item.name}</li>`;
    }).filter(Boolean).join("\n");
    addElem(`<ul>${relationships2}</ul>`, "relationship2");
    addElem(`<hr />`);

    // relationship (array)
    addElem(`<h3>Relationship 3 (array):</h3>`);
    addElem(`<ul><li>${data.relationship3.relationTo}: ${(data.relationship3.value as Tag | Category).name}</li></ul>`, "relationship3");
    addElem(`<hr />`);

    // relationship (array multi)
    addElem(`<h3>Relationship 4 (array multi):</h3>`);
    const relationships4 = data.relationship4.map((item, index) => {
        const value = item.value as Tag | Category;

        return `<li>${item.relationTo}: ${value.name}</li>`;
    }).filter(Boolean).join("\n");
    addElem(`<ul>${relationships4}</ul>`, "relationship4");
    addElem(`<hr />`);

    // rich text
    addElem(`<h3>Rich text:</h3>`);
    addElem(`<code>${JSON.stringify([data.richText])}</code>`, "richText");
    addElem(`<hr />`);

    // select 1
    addElem(`<h3>Select 1 (single):</h3>`);
    addElem(`<ul><li>${data.select1}</li></ul>`, "select1");
    addElem(`<hr />`);

    // select 2
    addElem(`<h3>Select 2 (multi):</h3>`);
    const selects = data.select2.map((item, index) => {
        return `<li>[${index}] = ${item}</li>`;
    }).filter(Boolean).join("\n");
    addElem(`<ul>${selects}</ul>`, "select2");
    addElem(`<hr />`);

    // text
    addElem(`<h3>Text:</h3>`);
    addElem(`<div>${data.text}</div>`, "text");
    addElem(`<hr />`);

    // textarea
    addElem(`<h3>Textarea:</h3>`);
    addElem(`<div>${data.textarea.replace(/(?:\r\n|\r|\n)/g, "<br>")}</div>`, "textarea");
    addElem(`<hr />`);

    // upload
    addElem(`<h3>Upload:</h3>`);
    const upload = data.upload as Medium;

    let mediaElem: string | null = null;

    if (upload.mimeType?.includes("image/")) {
        mediaElem = `<img src="${upload.url}" />`;
    } else if (upload.mimeType?.includes("video/")) {
        mediaElem = `<video controls><source src="${upload.url}" type="${upload.mimeType}"></video>`;
    }

    addElem(`
        <div>
            <div>${upload.filename}</div>
           ${(mediaElem) ? `<div class="media">${mediaElem}</div>` : ''}
        </div>
    `, "upload");
    addElem(`<hr />`);
}

const addElem = (data: string, name?: string) => {
    const container = document.getElementById("preview");
    const template = document.createElement("template");

    template.innerHTML = data.trim();

    const htmlNode = template.content.firstChild;

    if (container && htmlNode) {
        container.appendChild(htmlNode);

        if (name) {
            (htmlNode as HTMLElement).dataset.payloadFieldName = name;
        }
    }
}

const clearElements = () => {
    const container = document.getElementById("preview");
    if (container) container.innerHTML = "";
}

const ddToDms = (cardinalDirections: [string, string]) => (position: number) => {
    const round = (number: number) => {
        return Math.round(number * 100) / 100;
    };

    const dir = position >= 0 ? cardinalDirections[0] : cardinalDirections[1];
    const abs = Math.abs(position);
    const deg = abs | 0;
    const frac = abs - deg;
    const min = (frac * 60) | 0;
    const sec = round(frac * 3600 - min * 60);

    return `${deg}°${min}'${sec.toLocaleString()}"${dir}`;
};

const ns = ddToDms(["N", "S"]);
const ew = ddToDms(["E", "W"]);
