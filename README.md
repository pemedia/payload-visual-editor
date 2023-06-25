# Payload Visual Editor Plugin
This plugin provides a visual editor, including a nice UI, for [Payload](https://github.com/payloadcms/payload).

> **Note**
> This plugin is currently under active development and still in alpha stage. Please check back periodically for updates.

## Core features:

- Adds a visual editor component to your collections and globals:
  - Creates the visual editor UI in the Admin UIs edit view
  - Handles the live data exchange with your frontend 

![image](https://github.com/pemedia/payload-visual-live-preview/blob/main/visual-editor-screenshot.png?raw=true)

> **Note**
> For the collections in which you use the visual editor, fields in the `{admin: {position:'sidebar'}}` area will be rendered below all other fields, in the "main" area.

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
import { visualEditor } from 'payload-visual-editor';

// import styles
import 'payload-visual-editor/dist/styles.scss';

const config = buildConfig({
  collections: [...],
  plugins: [
    visualEditor({
      previewUrl: 'http://localhost:3001/pages/preview',
      collections: {
        [COLLECTION_SLUG]: {
          previewUrl: "..." // optional individual preview url for each collection
        },
      },
      globals: {
        [GLOBAL_SLUG]: {
          previewUrl: "..." // optional individual preview url for each global
        },
      },
    }),
  ],
});
```

### Options

- `previewUrl` : string | mandatory

  A string of the URL to your frontend preview route (e.g. `https://localhost:3001/pages/preview`).

- `collections` / `globals` : Record<string, { previewUrl?: string; }>

  An object with configs for all collections / globals which should enable the live preview.
  Use the collection / global slug as the key.
  If you don't want to override the previewUrl, just pass an empty object.

### Using Localization

if you are using Localization with multiple locales, it can be very handy, to be able to adjust the preview URL with the locale. Therefor you can add a `{{locale}}` placeholder anywhere into your `previewUrl` string (e.g. https://localhost:3001/{{locale}}/pages/preview`). 

The placeholder will automatically get replaces with the locale you are currently editing your content in. 

## Frontend Integration in Next.js 

In the next.js route which will handle your life preview use this code snippet to get the live post data of your collection directly from payload. In this case it's a collection with he name `page`. 

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
        <div>
          <RenderBlocks blocks={page.content} />
        </div>
      </main>
  </div>
)
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
