import { useEffect } from "react";

const getFieldName = (element: Element) => {
    const match = element.id.match(/field-(\w+)/);

    if (match) {
        return match[1];
    }

    const parent = element.closest(".field-type");

    if (parent) {
        const match = parent.id.match(/field-(\w+)/);

        if (match) {
            return match[1];
        }
    }

    return null;
};

export const useOnInputFocus = (callback: (fieldName: string) => any) => {
    useEffect(() => {
        const inputs = document.querySelectorAll("input");
        const unregister: Array<() => void> = [];

        inputs.forEach(input => {
            const name = getFieldName(input);

            if (name) {
                const handler = () => callback(name);

                input.addEventListener("focus", handler);

                unregister.push(() => input.removeEventListener("focus", handler));
            }
        });

        return () => {
            unregister.forEach(fn => fn());
        };
    }, []);
};
