import { useAllFormFields } from "payload/components/forms";
import { useEffect, useRef } from "react";

export const useFields = () => {
    const [fields] = useAllFormFields();
    const ref = useRef(fields);

    useEffect(() => {
        ref.current = fields;
    }, [fields]);

    return ref;
};
