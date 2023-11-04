import { Config } from "payload/config";
import { CollectionConfig, GlobalConfig } from "payload/types";
import { createVisualEditorView } from "./components/visualEditorView";
import { PreviewUrlFn } from "./types/previewUrl";

type CollectionOrGlobalConfig = CollectionConfig | GlobalConfig;

interface PluginCollectionOrGlobalConfig {
    previewUrl?: PreviewUrlFn;
}

export interface PluginConfig {
    previewUrl: PreviewUrlFn;
    showPreview?: boolean;
    collections?: Record<string, PluginCollectionOrGlobalConfig | undefined>;
    globals?: Record<string, PluginCollectionOrGlobalConfig | undefined>;
}

const extendCogConfigs = <T extends CollectionOrGlobalConfig>(
    previewUrl: PreviewUrlFn,
    showPreview?: boolean,
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
                        Default: {
                            Component: createVisualEditorView({ previewUrl: pluginCogConfig.previewUrl ?? previewUrl }),
                            path: "/preview",
                            Tab: {
                                label: "Preview",
                                href: "/preview",
                            },
                        },
                    },
                },
            },
        };
    }

    return cogConfig
}) ?? [];

export const visualEditor = (pluginConfig: PluginConfig) => (config: Config): Config => ({
    ...config,
    collections: extendCogConfigs(pluginConfig.previewUrl, pluginConfig.showPreview, config.collections, pluginConfig.collections),
    globals: extendCogConfigs(pluginConfig.previewUrl, pluginConfig.showPreview, config.globals, pluginConfig.globals),
});
