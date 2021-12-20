import React, { useState, useRef } from "react";
import logo from "../../assets/locker.svg";
import "primereact/resources/themes/vela-blue/theme.css";
import "primereact/resources/primereact.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import { Password } from "primereact/password";
import { Card } from "primereact/card";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { ScrollPanel } from "primereact/scrollpanel";
import PrimeReact from "primereact/api";
import FileManager from "./Manager.jsx";
import Info from "./Info.jsx";
import { useWindowSize, getTree, getKeys } from "./FuncsNHook";
const { ipcRenderer } = require("electron");

PrimeReact.ripple = true;
let auth = false;
let locked = true;

const validate = (
    pswrd,
    setLockStatus,
    setPswrdHelp,
    setDirStruct,
    setAuthKey,
    setKeys
) => {
    fetch("http://127.7.3.0:1728/api/auth", {
        headers: { "Pass-Key": pswrd },
    })
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            if (data) {
                setAuthKey(data);
                setPswrdHelp({
                    msg: "Correct Password",
                    vsblty: true,
                    class: "pi pi-check-circle",
                    color: "#9aef9a",
                });
                getKeys(data, setKeys);
                getTree(data, setDirStruct);
                auth = true;
                ipcRenderer.send("AUTH", data);
                return true;
            } else {
                setPswrdHelp({
                    msg: "Incorrect Password",
                    vsblty: true,
                    class: "pi pi-times-circle",
                    color: "#ef9a9a",
                });
                setLockStatus(true);
                auth = false;
                return false;
            }
        })
        .catch((err) => {
            console.error(err);
            return false;
        });
};

const App = () => {
    const [pswrd, setPswrd] = useState("");
    const [pswrdHelp, setPswrdHelp] = useState({
        msg: "",
        vsblty: false,
    });
    const { height } = useWindowSize();
    const [lockStatus, setLockStatus] = useState(true);
    const [dirStruct, setDirStruct] = useState(null);
    const [authKey, setAuthKey] = useState("");
    const [keys, setKeys] = useState("");
    const lockRef = useRef(null);

    const showLockDone = () => {
        if (auth) {
            if (!locked) {
                lockRef.current.show({
                    severity: "success",
                    summary: "Vault Locked",
                    detail: "",
                    life: 2000,
                });
                setLockStatus(true);
                locked = true;
            } else {
                lockRef.current.show({
                    severity: "info",
                    summary: "Vault is already locked",
                    detail: "",
                    life: 2000,
                });
            }
        } else {
            lockRef.current.show({
                severity: "warn",
                summary: "Enter Correct Password",
                detail: "",
                life: 2000,
            });
        }
    };
    const showUnlockDone = () => {
        if (auth) {
            if (locked) {
                lockRef.current.show({
                    severity: "success",
                    summary: "Vault Unlocked",
                    detail: "",
                    life: 2000,
                });
                getTree(authKey, setDirStruct);
                setLockStatus(false);
                locked = false;
            } else {
                lockRef.current.show({
                    severity: "info",
                    summary: "Vault Already Unlocked",
                    detail: "",
                    life: 2000,
                });
            }
        } else {
            lockRef.current.show({
                severity: "warn",
                summary: "Enter Correct Password",
                detail: "",
                life: 2000,
            });
        }
    };

    return (
        <ScrollPanel style={{ width: "100%", height: `${height}px` }}>
            <div className="p-d-flex p-flex-column p-pt-2">
                <div className="p-d-flex p-mb-2 p-jc-center">
                    <div>
                        <Info />
                    </div>
                    <h1 className="title p-px-3">File</h1>
                    <div>
                        <img src={logo} className="logo" />
                    </div>
                    <h1 className="title p-px-3">Vault</h1>
                </div>
                <div
                    className="p-d-inline-flex p-mb-2 p-pl-5"
                    style={{
                        alignItems: "flex-start",
                    }}
                >
                    <Card className="p-d-flex card outline">
                        <div className="p-px-4 p-fluid">
                            <h3>Password</h3>
                            <Password
                                className="p-rounded"
                                feedback={false}
                                toggleMask
                                value={pswrd}
                                onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                        validate(
                                            pswrd,
                                            setLockStatus,
                                            setPswrdHelp,
                                            setDirStruct,
                                            setAuthKey,
                                            setKeys
                                        );
                                    }
                                }}
                                onChange={(e) => {
                                    setPswrd(e.target.value);
                                }}
                            />
                            <small
                                id="password-help"
                                className="p-d-block p-p-1"
                                style={{ color: pswrdHelp.color }}
                            >
                                <i
                                    className={pswrdHelp.class}
                                    style={{
                                        fontSize: "1em",
                                        display: pswrdHelp.vsblty
                                            ? "unset"
                                            : "none",
                                    }}
                                ></i>
                                {" " + pswrdHelp.msg}
                            </small>
                            <Button
                                label="Submit"
                                className="p-button-raised"
                                style={{ margin: "auto", marginTop: "1rem" }}
                                onClick={() => {
                                    validate(
                                        pswrd,
                                        setLockStatus,
                                        setPswrdHelp,
                                        setDirStruct,
                                        setAuthKey,
                                        setKeys
                                    );
                                }}
                            />
                        </div>
                        <div className="p-d-flex p-jc-center p-pt-3">
                            <Button
                                label="Lock"
                                className="p-button-raised p-mr-2"
                                onClick={showLockDone}
                                icon="pi pi-lock"
                            />
                            <Button
                                label="Unlock"
                                className="p-button-raised p-mr-2"
                                onClick={showUnlockDone}
                                icon="pi pi-lock-open"
                            />
                        </div>
                        <Toast ref={lockRef} />
                    </Card>
                    <div className="p-pl-5 p-pr-5" style={{ width: "100%" }}>
                        <FileManager
                            dirStruct={dirStruct}
                            locked={lockStatus}
                            authKey={authKey}
                            keys={keys}
                        />
                    </div>
                </div>
            </div>
        </ScrollPanel>
    );
};

export default App;
