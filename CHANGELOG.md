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
