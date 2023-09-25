import { useState, useEffect } from "react";

export function useLocalStorageState(initialState, key) {
    const [state, setState] = useState(function () {
        const storedValue = localStorage.getItem(key);
        if (!storedValue) {
            return initialState;
        }
        return JSON.parse(storedValue);
    });

    useEffect(
        function () {
            const jsonString = JSON.stringify(state);
            localStorage.setItem(key, jsonString);
        },
        [state, key]
    );

    return [state, setState];
}
