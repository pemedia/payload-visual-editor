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

// TODO: use useEffectEvent when api is stable (https://react.dev/reference/react/experimental_useEffectEvent)
