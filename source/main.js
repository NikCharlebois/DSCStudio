var _a = require("electron"), app = _a.app, BrowserWindow = _a.BrowserWindow;
var win;
function createWindow() {
    win = new BrowserWindow({ height: 600, width: 800 });
    win.loadURL("file://" + __dirname + "/index.html");
    win.webContents.openDevTools();
    win.on("closed", function () {
        win = null;
    });
}
app.on("ready", createWindow);
app.on("window-all-closed", function () {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
app.on("activate", function () {
    if (win === null) {
        createWindow();
    }
});
