import React, { useState } from "react";
import "primereact/resources/themes/vela-blue/theme.css";
import "primereact/resources/primereact.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import { Tree } from "primereact/tree";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import ilstr from "../../assets/vault_illus.svg";
const dialog = require("electron").remote.dialog;

const nodeTemplate = (node, options) => {
    if (!node["children"]) {
        return (
            <div className="p-d-inline-flex">
                <span style={{ paddingRight: "15px" }}>{node["label"]}</span>
                <Button
                    onClick={() => {
                        // Opens a dialog box asking the user to give the downlaod path
                        let opts = {
                            title: `Saving ${node.label} from Vault`,

                            defaultPath:
                                "C:\\Users\\%UserProfile%\\Desktop\\" +
                                node.label,

                            buttonLabel: "Save",

                            filters: [
                                { name: "Vault File", extensions: [node.ext] },
                                { name: "All Files", extensions: ["*"] },
                            ],
                        };

                        dialog
                            .showSaveDialog(null, opts)
                            .then((file) => {
                                // Stating whether dialog operation was cancelled or not.
                                if (!file.canceled) {
                                    console.log(
                                        "Saved At:",
                                        file.filePath.toString()
                                    );
                                    fetch(
                                        `http://127.7.3.0:1728/api/v1/save?key=${encodeURI(
                                            node.key
                                        )}&path=${encodeURI(
                                            file.filePath.toString()
                                        )}`
                                    )
                                        .then((response) => {
                                            return response.json();
                                        })
                                        .then((data) => {
                                            console.log(
                                                data ? "Done" : "Not Done"
                                            );
                                        });
                                }
                            })
                            .catch((err) => {
                                console.error(err);
                            });
                    }}
                    icon="pi pi-download"
                    style={{ height: "1.5rem" }}
                />
            </div>
        );
    } else {
        return <span>{node.label}</span>;
    }
};

const FileManager = (props) => {
    if (props.locked) {
        return (
            <Card className="outline">
                <div className="p-d-flex p-flex-column p-ai-center">
                    <div className="p-text-center">
                        <h1>Unlock The Vault First</h1>
                    </div>
                    <img src={ilstr} className="illustration" />
                </div>
            </Card>
        );
    } else {
        console.log(props.dirStruct);
        return (
            <Card className="files outline">
                <div className="p-d-flex p-flex-column">
                    <div className="p-as-end p-p-2">
                        <Button
                            label="Download"
                            icon="pi pi-download"
                            className="p-button-raised p-button-warning"
                        />
                    </div>
                    <Tree
                        value={props.dirStruct}
                        nodeTemplate={nodeTemplate}
                        style={{ width: "100%" }}
                    />
                </div>
            </Card>
        );
    }
};

export default FileManager;
