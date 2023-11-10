import { RefObject, useEffect } from "react";

export const useResizeObserver = (targetRef: RefObject<HTMLElement>, cb: ResizeObserverCallback) => {
    useEffect(() => {
        const resizeObserver = new ResizeObserver(cb);

        setTimeout(() => {
            resizeObserver.observe(targetRef.current!);
        }, 0);

        return () => {
            resizeObserver.disconnect();
        };
    }, []);
};
