import { useState } from "react"

const getItem = (key: string) => {
    const item = localStorage.getItem(key);

    if (!item) {
        return null;
    }

    try {
        return JSON.parse(item);
    } catch (e) {
        return null;
    }
};

const setItem = (key: string, value: any) => {
    localStorage.setItem(key, JSON.stringify(value));
};

export const usePersistentState = <T>(key: string, defaultValue: T) => {
    const [state, setState_] = useState(getItem(key) || defaultValue);

    const setState = (value: T) => {
        setItem(key, value);
        setState_(value);
    };

    return [state, setState] as readonly [T, (value: T) => void];
};
