import React, { useState } from "react";
import "primereact/resources/themes/vela-blue/theme.css";
import "primereact/resources/primereact.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import ilstr from "../../assets/vault_illus.svg";
import { Tree } from "primereact/tree";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { downloadAll, downloadMany } from "./FuncsNHook";
import { existsSync } from "original-fs";
const dialog = require("electron").remote.dialog;

const FileManager = (props) => {
    const [selectedKeys, setSelectedKeys] = useState({});
    const [showWarning, setShowWarning] = useState(false);
    const [folderPath, setFolderPath] = useState("");

    const dialogFooter = () => {
        return (
            <div className="p-d-flex p-jc-center p-p-2">
                <Button
                    label="OK"
                    icon="pi pi-check"
                    className="p-button-raised"
                    onClick={() => setShowWarning(false)}
                    autoFocus
                />
            </div>
        );
    };

    const nodeTemplate = (node) => {
        if (!node["children"]) {
            return (
                <div className="p-d-inline-flex">
                    <span style={{ paddingRight: "15px" }}>
                        {node["label"]}
                    </span>
                </div>
            );
        } else {
            return <span>{node.label}</span>;
        }
    };

    if (props.locked) {
        return (
            <Card className="outline">
                <div className="p-d-flex p-flex-column p-ai-center">
                    <div className="p-text-center">
                        <h1>Unlock The Vault to view your Files</h1>
                    </div>
                    <img src={ilstr} className="illustration" />
                </div>
            </Card>
        );
    } else {
        return (
            <Card className="files outline">
                <div className="p-d-flex p-flex-column">
                    <div className="p-as-end p-p-2">
                        <Button
                            label={(function () {
                                let numOfKeys = 0;
                                for (let i of Object.keys(selectedKeys)) {
                                    if (selectedKeys[i].checked) {
                                        numOfKeys += 1;
                                    }
                                }
                                switch (numOfKeys) {
                                    case 0:
                                        return "Download All";
                                    case props.keys.length:
                                        return "Download All";
                                    default:
                                        return `Download ${numOfKeys}`;
                                }
                            })()}
                            icon="pi pi-download"
                            className="p-button-raised p-button-warning"
                            onClick={() => {
                                // Opens a dialog box asking the user to give the downlaod path
                                let opts = {
                                    title: `Destination for Vault Files`,

                                    defaultPath:
                                        "C:\\Users\\%UserProfile%\\Desktop\\",

                                    buttonLabel: "Select Folder",

                                    properties: ["openDirectory"],
                                };

                                dialog
                                    .showOpenDialog(null, opts)
                                    .then((file) => {
                                        // Stating whether dialog operation was cancelled or not.
                                        if (
                                            !file.canceled &&
                                            file.filePaths.toString() !== ""
                                        ) {
                                            setFolderPath(
                                                file.filePaths.toString()
                                            );
                                            if (
                                                !existsSync(
                                                    `${folderPath}\\Vault_Files`
                                                )
                                            ) {
                                                setShowWarning(false);
                                                let tmp =
                                                    Object.keys(
                                                        selectedKeys
                                                    ).length;
                                                if (tmp === props.keys.length) {
                                                    downloadAll(
                                                        props.authKey,
                                                        file.filePaths[0]
                                                    );
                                                } else if (tmp === 0) {
                                                    downloadAll(
                                                        props.authKey,
                                                        file.filePaths[0]
                                                    );
                                                } else {
                                                    let checked = [];
                                                    let partialChecked = [];

                                                    for (let i of Object.keys(
                                                        selectedKeys
                                                    )) {
                                                        if (
                                                            selectedKeys[i]
                                                                .checked
                                                        ) {
                                                            checked.push(i);
                                                        } else if (
                                                            selectedKeys[i]
                                                                .partialChecked
                                                        ) {
                                                            partialChecked.push(
                                                                i
                                                            );
                                                        }
                                                    }
                                                    downloadMany(
                                                        props.authKey,
                                                        file.filePaths[0],
                                                        checked,
                                                        partialChecked
                                                    );
                                                }
                                            } else {
                                                setShowWarning(true);
                                            }
                                        }
                                    })
                                    .catch((err) => {
                                        console.error(err);
                                    });
                            }}
                        />
                    </div>
                    <Tree
                        value={props.dirStruct}
                        nodeTemplate={nodeTemplate}
                        selectionMode="checkbox"
                        style={{ width: "100%" }}
                        selectionKeys={selectedKeys}
                        onSelectionChange={(e) => {
                            setSelectedKeys(e.value);
                        }}
                        filter
                        filterMode="lenient"
                    />
                </div>
                <Dialog
                    dismissableMask
                    visible={showWarning}
                    style={{ width: "25rem" }}
                    closable={false}
                    header="Warning"
                    footer={dialogFooter}
                    onHide={() => {
                        setShowWarning(false);
                    }}
                >
                    The directory <code>{folderPath}</code> already contains a
                    folder named <code>Vault_Files</code>. So either try
                    deleting it or choosing a different location.
                </Dialog>
            </Card>
        );
    }
};

export default FileManager;
