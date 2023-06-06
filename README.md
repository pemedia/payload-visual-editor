# Payload Visual Editor Plugin
This plugin provides a visual editor, including a nice UI, for [Payload](https://github.com/payloadcms/payload) collections.

Core features:

- Adds a visual editor component to your collections:
  - Creates the visual editor UI in the Admin UIs edit view
  - Handles the live data exchange with your frontend (currently focused on Next.js)

![image](https://github.com/pemedia/payload-visual-live-preview/blob/develop/visual-editor-screenshot.png?raw=true)

## Installation

```bash
  yarn add @tbd
  # OR
  npm i @tbd
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
  
  
### Frontend integration in Next.js 

tdb

```js
tbd
```

## Development

tbd
