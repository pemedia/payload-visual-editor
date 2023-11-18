import { useEffect } from "react";

const getFieldName = (element: Element): string | null => {
    const name = element.getAttribute?.("name");

    if (name) {
        return name;
    }

    const match = element.id?.match(/field-(\w+)/);

    if (match) {
        return match[1];
    }

    if (element.parentNode) {
        return getFieldName(element.parentNode as Element);
    }

    return null;
};

export const useOnInputFocus = (callback: (fieldName: string) => any) => {
    useEffect(() => {
        const unregister: Array<() => void> = [];

        setTimeout(() => {
            const inputs = document.querySelectorAll("input, textarea");

            inputs.forEach(input => {
                const name = getFieldName(input);

                if (name) {
                    const handler = () => callback(name);

                    input.addEventListener("focus", handler);

                    unregister.push(() => input.removeEventListener("focus", handler));
                }
            });
        }, 1000);

        return () => {
            unregister.forEach(fn => fn());
        };
    }, []);
};
