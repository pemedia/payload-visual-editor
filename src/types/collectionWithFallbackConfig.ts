import { CollectionConfig } from "payload/types";

export type CollectionWithFallbackConfig<T> = CollectionConfig & { custom: { fallback: T; }; };
