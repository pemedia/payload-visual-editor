import { Fields } from "payload/types";
import { useEffect, useRef } from "react";

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

export const useOnInputFocus = (fields: Fields, callback: (fieldName: string) => any) => {
    const debounce = useRef(false);
    const unregister = useRef<Array<() => void>>([]);

    useEffect(() => {
        if (debounce.current) {
            return;
        }

        debounce.current = true;

        setTimeout(() => {
            const inputs = document.querySelectorAll("input, textarea");

            inputs.forEach(input => {
                const name = getFieldName(input);

                if (name) {
                    const handler = () => callback(name);

                    input.addEventListener("focus", handler);

                    unregister.current.push(() => input.removeEventListener("focus", handler));
                }
            });

            debounce.current = false;
        }, 100);

        return () => {
            unregister.current.forEach(fn => fn());
        };
    }, [fields]);
};
