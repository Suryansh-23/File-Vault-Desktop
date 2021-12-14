import React, { useState, useRef } from "react";
import logo from "../../assets/locker.svg";
import "primereact/resources/themes/vela-blue/theme.css";
import "primereact/resources/primereact.css";
import "primeicons/primeicons.css";
import { Password } from "primereact/password";
import { Card } from "primereact/card";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import PrimeReact from "primereact/api";
import FileManager from "./Manager";
import "primeflex/primeflex.css";

const pswrd = () => {
  fetch("http://127.7.3.0:1728/api/v1/pswrd")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      vaultPswrd = data;
    })
    .catch(() => {
      pswrd();
    });
};
const tree = () => {
  fetch("http://127.7.3.0:1728/api/v1/tree")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      dirStruct = data;
    })
    .catch(() => {
      tree();
    });
};
pswrd();
tree();
PrimeReact.ripple = true;
let auth = false;
let locked = true;
let vaultPswrd, dirStruct;

const App = () => {
  const [pswrd, setPswrd] = useState("");
  const [pswrdHelp, setPswrdHelp] = useState({
    msg: "",
    vsblty: false,
  });
  const [lockStatus, setLockStatus] = useState(true);
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
    <div className="p-d-flex p-flex-column p-pt-2">
      <div className="p-d-flex p-mb-2 p-jc-center">
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
        <Card className="card p-d-flex">
          <div className="p-px-4 p-fluid">
            <h3>Password</h3>
            <Password
              className="p-rounded"
              feedback={false}
              toggleMask
              value={pswrd}
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
                  display: pswrdHelp.vsblty ? "unset" : "none",
                }}
              ></i>
              {" " + pswrdHelp.msg}
            </small>
            <Button
              label="Submit"
              className="p-button-raised"
              style={{ margin: "auto", marginTop: "1rem" }}
              onClick={() => {
                if (pswrd !== vaultPswrd) {
                  setPswrdHelp({
                    msg: "Incorrect Password",
                    vsblty: true,
                    class: "pi pi-times-circle",
                    color: "#ef9a9a",
                  });
                  setLockStatus(true);
                  auth = false;
                } else {
                  setPswrdHelp({
                    msg: "Correct Password",
                    vsblty: true,
                    class: "pi pi-check-circle",
                    color: "#9aef9a",
                  });
                  auth = true;
                }
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
          <FileManager dirStruct={dirStruct} locked={lockStatus} />
        </div>
      </div>
      <h2 style={{ position: "absolute", bottom: 0 }} className="p-pl-5">
        Created By Suryansh Chauhan
      </h2>
    </div>
  );
};

export default App;
