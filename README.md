# Payload Visual Live Preview Plugin
This plugin provides a visual live preview, including a nice UI, for [Payload](https://github.com/payloadcms/payload) collections.

Core features:

- Adds a `VisualEditor` component to your collections that:
  - Creates the visual editor UI in the Admin UIs edit view
  - Handles the live data exchange with your frontend (currently focused on Next.js)

## Installation

```bash
  yarn add @tbd
  # OR
  npm i @tbd
```

## Basic Usage

In the `plugins` array of your [Payload config](https://payloadcms.com/docs/configuration/overview), call the plugin with [options](#options):

```js
import { VisualEditor } from '../components/visualEditor';

const Collection: CollectionConfig = {
  slug: 'collection',
  admin: { },
  access: { },
  fields: [
    { /* all your fields */ },
    {
      name: 'visualeditor',
      type: 'ui',
      admin: {
        components: {
          Field: VisualEditor({
            getCollectionConfig: () => Pages,
            previewUrl: "YOUR_FRONTEND_PREVIEW_URL",
          }),
        },
      },
    },
  ],
}
```

### Options

- `collections` : string[] | optional

  An array of collections slugs to populate in the `to` field of each redirect.
  
- `previewUrl` : string | mandatory

  An string of the URL to your frontend preview route (e.g. https://localhost:3001/pages/preview).
  
  
### Frontend integration in Next.js 

tdb

```js
tbd
```

## Development

tbd
