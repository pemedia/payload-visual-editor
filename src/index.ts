import { Config } from "payload/config";
import { createVisualEditorField } from "./fields/visualEditorField";
import { createAdminSidebarField } from "./fields/adminSidebarField";
import { CollectionConfig, GlobalConfig, TabsField } from "payload/types";
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
        const tabsIndex = cogConfig.fields.findIndex(e => e.type === "tabs");
        const hasTabs = (tabsIndex > -1) ? true : false;

        if (hasTabs) {
            let fields = cogConfig.fields;
            let tabsContent = fields[tabsIndex] as TabsField;

            tabsContent.tabs = [
                ...tabsContent.tabs,
                {
                    label: "More",
                    fields: [
                        createAdminSidebarField(),
                    ],
                },
            ];

            fields[tabsIndex] = tabsContent;

            return {
                ...cogConfig,
                fields: [
                    ...fields,
                    createVisualEditorField({
                        previewUrl: pluginCogConfig.previewUrl ?? previewUrl,
                        showPreview,
                    }),
                ],
            };
        } else {
            return {
                ...cogConfig,
                fields: [
                    ...cogConfig.fields,
                    createAdminSidebarField(),
                    createVisualEditorField({
                        previewUrl: pluginCogConfig.previewUrl ?? previewUrl,
                        showPreview,
                    }),
                ],
            };
        }
    }

    return cogConfig
}) ?? [];

export const visualEditor = (pluginConfig: PluginConfig) => (config: Config): Config => ({
    ...config,
    collections: extendCogConfigs(pluginConfig.previewUrl, pluginConfig.showPreview, config.collections, pluginConfig.collections),
    globals: extendCogConfigs(pluginConfig.previewUrl, pluginConfig.showPreview, config.globals, pluginConfig.globals),
});
