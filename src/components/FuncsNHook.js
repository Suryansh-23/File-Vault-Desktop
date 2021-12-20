import { useState, useEffect } from "react";
const { shell } = require("electron").remote;

export const useWindowSize = () => {
    // Initialize state with undefined width/height so server and client renders match
    const [windowSize, setWindowSize] = useState({
        width: undefined,
        height: undefined,
    });
    useEffect(() => {
        // Handler to call on window resize
        function handleResize() {
            // Set window width/height to state
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        }
        // Add event listener
        window.addEventListener("resize", handleResize);
        // Call handler right away so state gets updated with initial window size
        handleResize();
        // Remove event listener on cleanup
        return () => window.removeEventListener("resize", handleResize);
    }, []); // Empty array ensures that effect is only run on mount
    return windowSize;
};

export const getTree = (authKey, setDirStruct) => {
    fetch("http://127.7.3.0:1728/api/tree", {
        headers: {
            "Auth-Key": authKey,
        },
    })
        .then((resp) => {
            return resp.json();
        })
        .then((data) => {
            setDirStruct(JSON.parse(data));
            return true;
        })
        .catch((err) => {
            console.error(err);
            return;
        });
};

export const getKeys = (authKey, setKeys) => {
    fetch("http://127.7.3.0:1728/api/keys", {
        headers: {
            "Auth-Key": authKey,
        },
    })
        .then((resp) => {
            return resp.json();
        })
        .then((data) => {
            setKeys(data);
            return true;
        })
        .catch((err) => {
            console.error(err);
            return;
        });
};

// Used by Manager.jsx
export const downloadAll = (authKey, path) => {
    fetch("http://127.7.3.0:1728/api/save_all", {
        headers: {
            "Auth-Key": authKey,
            Path: path,
        },
    })
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            if (data) {
                shell.openPath(`${path}\\Vault_Files`);
            }
        });
};

export const downloadMany = (authKey, path, checked, partialChecked) => {
    fetch("http://127.7.3.0:1728/api/save_many", {
        headers: {
            "Auth-Key": authKey,
            Path: path,
            Checked: JSON.stringify(checked),
            "Partial-Checked": JSON.stringify(partialChecked),
        },
    })
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            if (data) {
                shell.openPath(`${path}\\Vault_Files`);
            }
        });
};
