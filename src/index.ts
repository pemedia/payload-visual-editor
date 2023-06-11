import { Config } from "payload/config";
import { visualEditorField } from "./fields/visualEditorField";
import { PluginConfig } from "./types";

export const visualEditor = (pluginConfig: PluginConfig) => (config: Config): Config => {
    return {
        ...config,
        collections:
            config.collections?.map(collection => {
                const { slug } = collection
                const isEnabled = pluginConfig?.collections?.includes(slug)

                if (isEnabled) {
                    return {
                        ...collection,
                        fields: [
                            ...(collection?.fields || []),
                            ...visualEditorField(collection),
                        ],
                    }
                }

                return collection
            }) || [],
        globals:
            config.globals?.map(global => {
                const { slug } = global
                const isEnabled = pluginConfig?.globals?.includes(slug)

                if (isEnabled) {
                    return {
                        ...global,
                        fields: [...(global?.fields || []), ...visualEditorField(global)],
                    }
                }

                return global
            }) || [],
    }
};
