import { useEffect } from "react";

export const useOnInputFocus = (inputs: Map<string, HTMLInputElement | HTMLTextAreaElement>, callback: (fieldName: string) => any) => {
    useEffect(() => {
        const unregister: Array<() => void> = [];

        inputs.forEach((input, fieldName) => {
            const handler = () => callback(fieldName);

            input.addEventListener("focus", handler);

            unregister.push(() => input.removeEventListener("focus", handler));
        });

        return () => {
            unregister.forEach(fn => fn());
        };
    }, [inputs]);
};
