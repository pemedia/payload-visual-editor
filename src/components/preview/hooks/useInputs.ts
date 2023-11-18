import { Fields } from "payload/types";
import { useEffect, useRef, useState } from "react";

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

export const useInputs = (fields: Fields) => {
    const debounce = useRef(false);

    const ref = useRef<Map<string, HTMLInputElement | HTMLTextAreaElement>>(new Map());

    useEffect(() => {
        if (debounce.current) {
            return;
        }

        debounce.current = true;

        setTimeout(() => {
            const inputs = document.querySelectorAll("input, textarea");
            const map = new Map();

            inputs.forEach(input => {
                const fieldName = getFieldName(input);

                if (fieldName) {
                    map.set(fieldName, input);
                }
            });

            ref.current = map;

            debounce.current = false;
        }, 100);
    }, [fields]);

    return ref;
};
