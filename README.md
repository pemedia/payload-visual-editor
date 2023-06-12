# Payload Visual Editor Plugin
This plugin provides a visual editor, including a nice UI, for [Payload](https://github.com/payloadcms/payload) collections.

> **Note**
> This plugin is currently under active development and still in alpha stage. Please check back periodically for updates.

## Core features:

- Adds a visual editor component to your collections:
  - Creates the visual editor UI in the Admin UIs edit view
  - Handles the live data exchange with your frontend (currently focused on Next.js)

![image](https://github.com/pemedia/payload-visual-live-preview/blob/main/visual-editor-screenshot.png?raw=true)

> **Warning**
> In the Admin UI of the collections in which you use the visual editor plugin, you cannot use any elements in the `{admin: {position:'sidebar'}}` because for now we have to hide this area of the sidebar, to make the preview UI work. But we are elaborating on options to solve this in the future.

## Installation

```bash
  yarn add payload-plugin-visualeditor
  # OR
  npm i payload-plugin-visualeditor
```

## Basic Usage

In the `plugins` array of your [Payload config](https://payloadcms.com/docs/configuration/overview), call the plugin with [options](#options):

```js
import visualeditor from '@tbd-plugin-path/visualeditor'

const config = buildConfig({
  collections: [...],
  plugins: [
    visualeditor({
      collections: ['COLLECTION_SLUG'],
      previewUrl: 'http://localhost:3001/pages/preview',
    }),
  ]
});

```

### Options

- `collections` : string[] | mandatory

  An array of collections slugs to definde, where the visual editor will be implemented (e.g. `['pages','posts']`).
  
- `previewUrl` : string | mandatory

  An string of the URL to your frontend preview route (e.g. `https://localhost:3001/pages/preview`).
  
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
You can now pass this to your block render function. In this case `page.content`, because `content` is the name of our 'blocks' field in our payload CollectionConfig.

```js
<RenderBlocks blocks={page.content} />
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
yarn plugin:yarn
```

3. Install dependencies of the payload example:

```sh
yarn example:cms:yarn
```

4. Run the payload dev server:

```sh
yarn example:cms:dev
```

5. Open another terminal and install dependencies of the frontend example:

```sh
yarn example:website:yarn
```

6. Start the dev server for the frontend:

```sh
yarn example:website:dev
```

- After changing collections, fields, etc., you can use `yarn example:cms:generate-types` to create an updated interface file.
- To connect with the node container, run `yarn shell`.
