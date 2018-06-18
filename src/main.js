const {app, Tray,Menu, BrowserWindow} = require('electron')
var path = require("path")
const html_path = path.join(__dirname, './html/');
const img_path = path.join(__dirname, './img/');
const logs = require('./lib/logs')
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
const autoUpdater = require('electron-updater').autoUpdater
const ipcMain = require('electron').ipcMain
const uploadUrl='http://www.d-shang.com/static/dist/'
// 检测更新，在你想要检查更新的时候执行，renderer事件触发后的操作自行编写


let win = null;
let tray = null;

function createWindow () {
    // 创建浏览器窗口。
    win = new BrowserWindow({width: 1600, height: 800, frame: true})

    // 然后加载应用的 index.html。
    win.loadFile(html_path + 'index.html')
    logs.log('success load html: ' + html_path + 'index.html')
    // 打开开发者工具
    win.webContents.openDevTools()

    // 当 window 被关闭，这个事件会被触发。
    win.on('closed', () => {
        // 取消引用 window 对象，如果你的应用支持多窗口的话，
        // 通常会把多个 window 对象存放在一个数组里面，
        // 与此同时，你应该删除相应的元素。
        win = null
    })
    updateHandle();
}
function updateHandle() {
    let message = {
        error: '检查更新出错',
        checking: '正在检查更新……',
        updateAva: '检测到新版本，正在下载……',
        updateNotAva: '现在使用的就是最新版本，不用更新',
    };
    const os = require('os');

    autoUpdater.setFeedURL(uploadUrl);
    autoUpdater.on('error', function (error) {
        console.log(error);
        sendUpdateMessage(message.error)
    });
    autoUpdater.on('checking-for-update', function () {
        console.log(message);

        sendUpdateMessage(message.checking)
    });
    autoUpdater.on('update-available', function (info) {
        console.log(message);

        sendUpdateMessage(message.updateAva)
    });
    autoUpdater.on('update-not-available', function (info) {
        sendUpdateMessage(message.updateNotAva)
    });

    // 更新下载进度事件
    autoUpdater.on('download-progress', function (progressObj) {
        mainWindow.webContents.send('downloadProgress', progressObj)
    })
    autoUpdater.on('update-downloaded', function (event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) {

        ipcMain.on('isUpdateNow', (e, arg) => {
            console.log(arguments);
        console.log("开始更新");
        //some code here to handle event
        autoUpdater.quitAndInstall();
    });

        mainWindow.webContents.send('isUpdateNow')
    });

    ipcMain.on("checkForUpdate",()=>{
        //执行自动更新检查
        autoUpdater.checkForUpdates();
})
}

// 通过main进程发送事件给renderer进程，提示更新信息
function sendUpdateMessage(text) {
    mainWindow.webContents.send('message', text)
}
function createTray(){
    tray = new Tray(img_path + 'ImageScanner.ico')
    const contextMenu = Menu.buildFromTemplate([
        {label: 'Item1', type: 'radio'},
        {label: 'Item2', type: 'radio'},
        {label: 'Item3', type: 'radio', checked: true},
        {label: 'Item4', type: 'radio'}
    ])
    tray.setToolTip('This is my application.')
    tray.setContextMenu(contextMenu)
    logs.log('success load tray: ' + img_path + 'ImageScanner.ico')
}
// Electron 会在初始化后并准备
// 创建浏览器窗口时，调用这个函数。
// 部分 API 在 ready 事件触发后才能使用。
app.on('ready', () => {
    createWindow();
    createTray();
})

// 当全部窗口关闭时退出。
app.on('window-all-closed', () => {
    // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
    // 否则绝大部分应用及其菜单栏会保持激活。
    app.quit()
})

app.on('activate', () => {
    // 在macOS上，当单击dock图标并且没有其他窗口打开时，
    // 通常在应用程序中重新创建一个窗口。
    if (win === null) {
    createWindow()
}
})

// 在这个文件中，你可以续写应用剩下主进程代码。
// 也可以拆分成几个文件，然后用 require 导入。