import React, { useState } from "react";
import "primereact/resources/themes/vela-blue/theme.css";
import "primereact/resources/primereact.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import { Tree } from "primereact/tree";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
const dialog = require("electron").remote.dialog;

const nodeTemplate = (node, options) => {
  if (!node["children"]) {
    return (
      <div className="p-d-inline-flex">
        <span style={{ paddingRight: "15px" }}>{node["label"]}</span>
        <Button
          onClick={() => {
            let options = {
              title: `Saving ${node.label} from Vault`,

              defaultPath: "C:\\Users\\%UserProfile%\\Desktop\\" + node.label,

              buttonLabel: "Save",

              filters: [
                { name: "Vault File", extensions: [node.ext] },
                { name: "All Files", extensions: ["*"] },
              ],
            };

            dialog
              .showSaveDialog(null, options)
              .then((file) => {
                // Stating whether dialog operation was cancelled or not.
                if (!file.canceled) {
                  console.log("Saved At:", file.filePath.toString());
                  fetch(
                    `http://127.7.3.0:1728/api/v1/save?key=${encodeURI(
                      node.key
                    )}&path=${encodeURI(file.filePath.toString())}`
                  )
                    .then((response) => {
                      return response.json();
                    })
                    .then((data) => {
                      console.log(data ? "Done" : "Not Done");
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
      <Card className="files">
        <div className="p-text-center">
          <h2>Unlock The Vault First</h2>
        </div>
      </Card>
    );
  } else {
    return (
      <Card className="files">
        <Tree
          value={props.dirStruct}
          nodeTemplate={nodeTemplate}
          style={{ width: "100%" }}
        />
      </Card>
    );
  }
};

export default FileManager;
