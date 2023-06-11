import { Config } from "payload/config";
import { createVisualEditorField } from "./fields/visualEditorField";
import { CollectionConfig, GlobalConfig } from "payload/types";

type CollectionOrGlobalConfig = CollectionConfig | GlobalConfig;

interface PluginCollectionOrGlobalConfig {
    previewUrl?: string;
}

export interface PluginConfig {
    previewUrl: string;
    collections?: Record<string, PluginCollectionOrGlobalConfig | undefined>;
    globals?: Record<string, PluginCollectionOrGlobalConfig | undefined>;
}

const extendCogConfigs = <T extends CollectionOrGlobalConfig>(
    previewUrl: string,
    cogConfigs?: T[],
    pluginCogConfigs?: Record<string, PluginCollectionOrGlobalConfig | undefined>,
) => cogConfigs?.map(cogConfig => {
    const pluginCogConfig = pluginCogConfigs?.[cogConfig.slug];

    if (pluginCogConfig) {
        return {
            ...cogConfig,
            fields: [
                ...cogConfig.fields,
                createVisualEditorField(pluginCogConfig.previewUrl ?? previewUrl),
            ],
        };
    }

    return cogConfig
}) ?? [];

export const visualEditor = (pluginConfig: PluginConfig) => (config: Config): Config => ({
    ...config,
    collections: extendCogConfigs(pluginConfig.previewUrl, config.collections, pluginConfig.collections),
    globals: extendCogConfigs(pluginConfig.previewUrl, config.globals, pluginConfig.globals),
});
