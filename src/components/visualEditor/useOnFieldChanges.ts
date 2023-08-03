import { Fields } from "payload/dist/admin/components/forms/Form/types";
import { useEffect, useRef } from "react";

export const useOnFieldChanges = (fields: Fields, callback: () => any) => {
    const debounce = useRef(false);

    useEffect(() => {
        if (debounce.current) {
            return;
        }

        debounce.current = true;

        setTimeout(() => {
            callback();

            debounce.current = false;
        }, 100);
    }, [fields]);
};
