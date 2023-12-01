import { Config } from "payload/config";
import { CollectionConfig, GlobalConfig } from "payload/types";
import { createVisualEditorView } from "./components/visualEditorView";
import { PreviewMode } from "./types/previewMode";
import { PreviewUrlFn } from "./types/previewUrl";

export * from "./types/collectionWithFallbackConfig";
export * from "./types/globalWithFallbackConfig";

type CollectionOrGlobalConfig = CollectionConfig | GlobalConfig;

interface PluginCollectionOrGlobalConfig {
    previewUrl?: PreviewUrlFn;
}

export interface PluginConfig {
    previewUrl: PreviewUrlFn;
    defaultPreviewMode?: PreviewMode;
    previewWidthInPercentage?: number;
    collections?: Record<string, PluginCollectionOrGlobalConfig | undefined>;
    globals?: Record<string, PluginCollectionOrGlobalConfig | undefined>;
}

const extendCogConfigs = <T extends CollectionOrGlobalConfig>(
    previewUrl: PreviewUrlFn,
    defaultPreviewMode?: PreviewMode,
    previewWidthInPercentage?: number,
    cogConfigs?: T[],
    pluginCogConfigs?: Record<string, PluginCollectionOrGlobalConfig | undefined>,
) => cogConfigs?.map(cogConfig => {
    const pluginCogConfig = pluginCogConfigs?.[cogConfig.slug];

    if (pluginCogConfig) {
        cogConfig.admin = {
            ...cogConfig.admin,
            components: {
                ...cogConfig.admin?.components,
                views: {
                    ...cogConfig.admin?.components?.views,
                    Edit: {
                        ...cogConfig.admin?.components?.views?.Edit,
                        Default: createVisualEditorView({
                            previewUrl: pluginCogConfig.previewUrl ?? previewUrl,
                            defaultPreviewMode: defaultPreviewMode ?? "iframe",
                            previewWidthInPercentage: previewWidthInPercentage ?? 50,
                        }),
                    } as any,
                },
            },
        };
    }

    return cogConfig
}) ?? [];

export const visualEditor = (pluginConfig: PluginConfig) => (config: Config): Config => ({
    ...config,
    collections: extendCogConfigs(
        pluginConfig.previewUrl,
        pluginConfig.defaultPreviewMode,
        pluginConfig.previewWidthInPercentage,
        config.collections,
        pluginConfig.collections,
    ),
    globals: extendCogConfigs(
        pluginConfig.previewUrl,
        pluginConfig.defaultPreviewMode,
        pluginConfig.previewWidthInPercentage,
        config.globals,
        pluginConfig.globals,
    ),
});
