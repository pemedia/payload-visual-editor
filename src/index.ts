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
    cogConfigs?: T[],
    pluginCogConfigs?: Record<string, PluginCollectionOrGlobalConfig | undefined>,
) => cogConfigs?.map(cogConfig => {
    const pluginCogConfig = pluginCogConfigs?.[cogConfig.slug];

    if (pluginCogConfig) {
        return {
            ...cogConfig,
            fields: [
                ...cogConfig.fields,
                createVisualEditorField(cogConfig),
            ],
        };
    }

    return cogConfig
}) ?? [];

export const visualEditor = (pluginConfig: PluginConfig) => (config: Config): Config => ({
    ...config,
    collections: extendCogConfigs(config.collections, pluginConfig.collections),
    globals: extendCogConfigs(config.globals, pluginConfig.globals),
});
