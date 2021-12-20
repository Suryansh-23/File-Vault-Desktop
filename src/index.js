import React from "react";
import { render } from "react-dom";
import App from "./components/App.jsx";
import "./App.css";
// const app = require("electron").remote.app;

// const cleanup = () => {
//     fetch("http://127.7.3.0:1728/kill")
//         .then(() => {
//             console.log("Proc Killed");
//         })
//         .catch((err) => {
//             console.error(err);
//         });
// };

// Since we are using HtmlWebpackPlugin WITHOUT a template, we should create our own root node in the body element before rendering into it
let root = document.createElement("div");

root.id = "root";
document.body.appendChild(root);

// Now we can render our application into it
render(<App />, document.getElementById("root"));

// app.on("before-quit", () => {
//     console.log("App Closed");
//     for (let i = 0; i < 100; i++) {
//         cleanup();
//     }
// });
