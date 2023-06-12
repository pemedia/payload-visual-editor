import { RefObject, useEffect } from "react";

export const useResizeObserver = (targetRef: RefObject<HTMLElement>, cb: ResizeObserverCallback) => {
    useEffect(() => {
        const resizeObserver = new ResizeObserver(cb);

        resizeObserver.observe(targetRef.current!);

        return () => {
            if(targetRef.current) resizeObserver.unobserve(targetRef.current!);
        };
    }, []);
};
