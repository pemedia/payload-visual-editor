export interface PluginConfig {
    collections?: String[]
    globals?: String[]
    basePreviewUrl: string
    previewUrls?: Array<{ slug: string, url: string }>
}
