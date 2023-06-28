export interface PreviewUrlParams {
    locale: string;
}

export type PreviewUrlFn = (params: PreviewUrlParams) => string;
