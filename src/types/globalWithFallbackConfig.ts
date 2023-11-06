import { GlobalConfig } from "payload/types";

export type GlobalWithFallbackConfig<T> = GlobalConfig & { custom: { fallback: T; } };
