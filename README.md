# Payload Visual Editor Plugin
> **Note**
> This plugin provides a visual live preview, including a nice UI, for **[Payload](https://github.com/payloadcms/payload)**  
>   
> Version 0.x.x is compatible with Payload 1.x.x  
> Version 2.x.x is compatible with Payload 2.x.x  

## Core features:

- Adds a visual editor component to your collections and globals:
  - Creates the visual editor UI in the Admin UIs edit view
  - Handles the live data exchange with your frontend 

![image](https://github.com/pemedia/payload-visual-live-preview/blob/main/visual-editor-screenshot.png?raw=true)

## Installation

```bash
  yarn add payload-visual-editor
  # OR
  npm i payload-visual-editor
```

## Basic Usage

In the `plugins` array of your [Payload config](https://payloadcms.com/docs/configuration/overview), call the plugin with [options](#options):

```js
// import plugin
import { visualEditor } from "payload-visual-editor";

// import styles
import "payload-visual-editor/dist/styles.scss";

const config = buildConfig({
  collections: [...],
  plugins: [
    visualEditor({
      previewUrl: () => `http://localhost:3001/pages/preview`,
      collections: {
        [COLLECTION_SLUG]: {
          previewUrl: () => `...` // optional individual preview url for each collection
        },
      },
      globals: {
        [GLOBAL_SLUG]: {
          previewUrl: () => `...` // optional individual preview url for each global
        },
      },
    }),
  ],
});
```

### Options

- `previewUrl` : `({ locale: string; }) => string | mandatory`

  A function returning a string of the URL to your frontend preview route (e.g. `https://localhost:3001/pages/preview`). The `locale` property can be used if needed for [preview localization](#Localization).

- `defaultPreviewMode` : `"iframe" | "popup" | "none"`

  Preferred preview mode while opening an edit page the first time. After toggling, the state will be saved in localStore. Default: "iframe"

- `collections` / `globals` : `Record<string, { previewUrl?: ({ locale: string; }) => string; }>`

  An object with configs for all collections / globals which should enable the live preview. Use the collection / global slug as the key. If you don't want to override the previewUrl, just pass an empty object.

### Localization

If you are using Localization with multiple locales, it can be very handy, to be able to adjust the preview URL based on the selected/current locale. You can pass `locale` to the `previewUrl` function in your payload config an place it, where your frontend needs it to be:

```js
const config = buildConfig({
  collections: [...],
  plugins: [
    visualEditor({
      previewUrl: params => `https://localhost:3001/${params.locale}/pages/preview`
      ...
    }),
  ],
});
```

### Relation Fallbacks

When adding blocks or editing relationship / upload fields, you will often encounter the issue that the data is incomplete.
For instance, because no relation has been selected yet.
However, when such fields are marked as required and there is no check for undefined values in the frontend, 
it can lead to unexpected errors in the rendering process.  
To address this problem, fallbacks can be set up for the collections / globals.
In cases where a field is required but no value has been selected, the fallback of the respective collection will be returned.

```js
import { CollectionWithFallbackConfig } from "payload-visual-editor";

export const Tags: CollectionWithFallbackConfig<Tag> = {
    slug: "tags",
    fields: [
        {
            name: "name",
            type: "text",
            required: true,
        },
    ],
    custom: {
        fallback: {
            id: "",
            name: "Fallback Tag",
            createdAt: "",
            updatedAt: "",
        },
    },
};
```

## Frontend Integration in React / Next.js 

In the next.js route which will handle your life preview use this code snippet to get the live post data of your collection directly from payload. In this case it"s a collection with he name `page`. 

```js
const [page, setPage] = useState<Page | null>(null);

useEffect(() => {
    const listener = (event: MessageEvent) => {
        if (event.data.cmsLivePreviewData) {
            setPage(event.data.cmsLivePreviewData);
        }
    };

    window.addEventListener("message", listener, false);

    return () => {
        window.removeEventListener("message", listener);
    };
}, []);
```

You can now pass this to your render function and you can use all your payload collection data in there. For example like this:

```js
return (
    <div>
        <header>
            <h1>{page.title}</h1>
        </header>
        <main>
            <RenderBlocks blocks={page.content} />
        </main>
    </div>
);
```

Since the document will only be send to the frontend after a field has been changed the preview page wouldn"t show any data on first render.
To inform the cms to send the current document state to the frontend, send a `ready` message to the parent window, as soon as the DOM / react app is ready:

```js
// react
useEffect(() => {
    (opener ?? parent).postMessage("ready", "*");
}, []);

// vanilla js
window.addEventListener("DOMContentLoaded", () => {
    (opener ?? parent).postMessage("ready", "*");
});
```

## Development

This repo includes a demo project with payload as the backend and a simple website written in plain TypeScript.
To start the demo, follow these steps:

1. Start docker and wait until the containers are up:

```sh
docker-compose up
```

2. Open another terminal and install root dependencies:

```sh
yarn docker:plugin:yarn
```

3. Install dependencies of the payload example:

```sh
yarn docker:example:cms:yarn
```

4. Run the payload dev server:

```sh
yarn docker:example:cms:dev
```

5. Open another terminal and install dependencies of the frontend example:

```sh
yarn docker:example:website:yarn
```

6. Start the dev server for the frontend:

```sh
yarn docker:example:website:dev
```

- After changing collections, fields, etc., you can use `yarn docker:example:cms:generate-types` to create an updated interface file.
- To connect with the node container, run `yarn docker:shell`.
- To connect with the database container, run `yarn docker:mongo`.
