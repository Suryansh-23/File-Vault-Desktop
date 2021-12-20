const path = require("path");
const url = require("url");
const { execFile } = require("child_process");
const { app, BrowserWindow, ipcMain } = require("electron");
const { stdout, stderr } = require("process");

let mainWindow;
let isDev = false;
let backend;
let auth;

ipcMain.on("AUTH", (_, arg) => (auth = arg));

const cleanup = () => {
    const axios = require("axios");

    axios
        .get("http://127.7.3.0:1728/kill", {
            headers: { "Auth-Key": auth },
        })
        .then((response) => {
            stdout.write(response.data);
        })
        .catch((error) => {
            stderr.write(error);
        });
};

if (
    process.env.NODE_ENV !== undefined &&
    process.env.NODE_ENV === "development"
) {
    isDev = true;
    console.log("Creating backend");
    backend = execFile(
        "python",
        ["./python/Vault.py"],
        (error, sout, stderr) => {
            stdout.write(`Python : ${sout}`);
            if (error) {
                console.error(stderr);
                throw error;
            }
            console.log(stdout);
        }
    );
}

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 720,
        height: 720,
        minWidth: 900,
        minHeight: 720,
        title: "File Vault",
        show: false,
        resizable: true,
        icon: `${__dirname}/assets/locker.png`,
        webPreferences: {
            enableRemoteModule: true,
            nodeIntegration: true,
            webSecurity: false,
        },
    });

    let indexPath;

    if (isDev && process.argv.indexOf("--noDevServer") === -1) {
        indexPath = url.format({
            protocol: "http:",
            host: "localhost:8080",
            pathname: "index.html",
            slashes: true,
        });
    } else {
        indexPath = url.format({
            protocol: "file:",
            pathname: path.join(__dirname, "dist", "index.html"),
            slashes: true,
        });
    }

    mainWindow.loadURL(indexPath);

    // Don't show until we are ready and loaded
    mainWindow.once("ready-to-show", () => {
        mainWindow.show();
    });

    mainWindow.on("closed", () => (mainWindow = null));
}

app.on("ready", createMainWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        backend.kill("SIGTERM");
        app.quit();
        stdout.write("JS Closed\n");
        cleanup();
        stdout.write("Python Closed\n");
    }
});

app.on("activate", () => {
    if (mainWindow === null) {
        createMainWindow();
    }
});

// Stop error
app.allowRendererProcessReuse = true;
