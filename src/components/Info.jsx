import React, { useState } from "react";
import logo from "../../assets/locker.svg";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Chip } from "primereact/chip";
const { shell } = require("electron").remote;

const Info = () => {
    const [displayDialog, setDisplayDialog] = useState(false);

    return (
        <>
            <Button
                icon="pi pi-info"
                className="info-button p-button-raised p-button-outlined p-button-info"
                onClick={() => {
                    setDisplayDialog(true);
                }}
            />
            <Dialog
                dismissableMask
                visible={displayDialog}
                style={{ width: "30rem" }}
                closable={false}
                header="Info"
                onHide={() => {
                    setDisplayDialog(false);
                }}
            >
                <div className="p-d-flex p-flex-column">
                    <div className="p-d-flex">
                        <img className="info-logo p-pr-2" src={logo} />
                        <div>
                            File Vault is an{" "}
                            <span className="info-span">
                                AES-Enabled Encryption
                            </span>{" "}
                            software that helps you in keep your precious files
                            and data safe.With an{" "}
                            <span className="info-span">
                                easy to access ui and authentication mechanism.
                            </span>{" "}
                            This standalone program is a part of a larger
                            Cryptgraphic Software Suite{" "}
                            <span className="info-span">Project Leɘk.</span>
                        </div>
                    </div>
                    <div
                        className="p-d-inline-flex p-jc-center"
                        style={{ paddingTop: "0.5rem" }}
                    >
                        <span
                            className="info-span"
                            style={{ fontSize: "1.25rem" }}
                        >
                            Created By Suryansh Chauhan
                        </span>
                    </div>
                    <div className="p-d-inline-flex p-jc-center p-pt-3">
                        <div
                            onClick={() => {
                                console.log("clicked");
                                shell.openExternal("https://github.com");
                            }}
                        >
                            <Chip
                                label="Github"
                                icon="pi pi-github"
                                className="p-mr-2 p-mb-2 custom-chip"
                            />
                        </div>
                        <div
                            onClick={() => {
                                console.log("clicked");
                                shell.openExternal(
                                    "https://en.wikipedia.org/wiki/Advanced_Encryption_Standard"
                                );
                            }}
                        >
                            <Chip
                                label="Wikipedia"
                                icon="pi info-wiki"
                                className="p-mr-2 p-mb-2 custom-chip"
                            />
                        </div>
                    </div>
                </div>
            </Dialog>
        </>
    );
};

export default Info;
