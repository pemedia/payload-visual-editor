## 2.0.4

### Bug Fixes
- Fixed bundling styles with vite

## 2.0.3

### Bug Fixes
- Fixed parsing presentational fields in block.

## 2.0.2

## 2.0.1

## 2.0.0

### Features
- Plugin is now available for Payload 2.x.x
- The preview can now be opened in a separate window and in an iframe.

### Breaking Changes
- Changed `options.showPreview` to `options.defaultPreviewMode`.
- To fetch the current document state on first render, you have to send a ready event to the cms (s. [Frontend Integration in React / Next.js](https://github.com/pemedia/payload-visual-editor#frontend-integration-in-react--nextjs)).

## 0.1.4

### Bug Fixes
- Fixed parsing block fields while values are undefined (#20)

## 0.1.3

### Bug Fixes
- Passing API path set in config to fetch relations (#18)

## 0.1.2

### Bug Fixes
- Added missing react-i18next as peer dependency (#17)

## 0.1.1

### Features
- Configuration option to hide preview by default  (#11) 
- New logic to generate the preview data, now handling all Payload field types

### Bug Fixes
- Fixed layout for collections and globals using versioning and drafts (#14)
- Showing versions and timestamps in sidebar, when versioning is enabled
- Correct API url and link for globals in the sidebar area (#13) 

## 0.1.0

### Features
- 'previewUrl' localization: Added the option to create a custom locale based previewUrl.
- fields from the `{admin: {position:'sidebar'}}` will be placed in an extra tab called "More", if tabs are beeing used in a collection or global.
- Little styling adjustments to make the preview frame visually more present.

### Breaking Changes
- The `previewUrl` option is now a string returning function instead of a string.

## 0.0.5

### Features
- fields from the `{admin: {position:'sidebar'}}` are now useable. (in the main fields area)

## 0.0.4

### Bug Fixes
- Get all fields recursively to allow nested presentational fields.

## 0.0.3

### Bug Fixes
- Flatten all presenational only fields.
