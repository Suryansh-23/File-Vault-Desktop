const path = require("path");
const url = require("url");
const { spawn } = require("child_process");
const { app, BrowserWindow } = require("electron");

let mainWindow;

let isDev = false;

if (
  process.env.NODE_ENV !== undefined &&
  process.env.NODE_ENV === "development"
) {
  isDev = true;
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

  const python = spawn("python", ["./python/Vault.py"]);
  python.stdout.on("data", () => {});

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
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createMainWindow();
  }
});

// Stop error
app.allowRendererProcessReuse = true;
