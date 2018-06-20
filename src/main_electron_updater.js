const {app, Tray,Menu, BrowserWindow, ipcMain} = require('electron')
var path = require("path")
const html_path = path.join(__dirname, './html/');
const img_path = path.join(__dirname, './img/');
const static_path = path.join(__dirname, './');

const logs = require('./lib/logs')
// 在主进程里
global.sharedObject = {
    lib_path: path.join(__dirname, './lib/')
};
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
const autoUpdater = require('electron-updater').autoUpdater
//const uploadUrl='http://www.pansq.info:8081/download/'
const uploadUrl='http://127.0.0.1:8081/download/'
// 检测更新，在你想要检查更新的时候执行，renderer事件触发后的操作自行编写

let win = null;
let tray = null;

function createWindow () {
    // 创建浏览器窗口。
    win = new BrowserWindow({width: 1600, height: 800, frame: true})
    //win.loadURL('https://www.baidu.com');

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
    eventHandle();
}
function eventHandle(){
    ipcMain.on('asynchronous-message', (event, arg) => {
        console.log(arg)
        win.loadFile(html_path + 'index.html')
    })
}
function updateHandle() {
    let message = {
        error: 'check update error',
        checking: 'checking update ...',
        updateAva: 'checked laster version, downloading ...',
        updateNotAva: 'the version is laster',
    };
    const os = require('os');

    autoUpdater.setFeedURL(uploadUrl);
    autoUpdater.on('error', function (error) {
        logs.log(message.error)
    });
    autoUpdater.on('checking-for-update', function () {
        logs.log(message.checking)
    });
    autoUpdater.on('update-available', function (info) {
        logs.log(message.updateAva);
    });
    autoUpdater.on('update-not-available', function (info) {
        logs.log(message.updateNotAva)
    });

    // 更新下载进度事件
    autoUpdater.on('download-progress', function (progressObj) {
        logs.log('----------');
    })
    autoUpdater.on('update-downloaded', function (event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) {

        logs.log("start update install");
            //some code here to handle event
            autoUpdater.quitAndInstall();
    });


    autoUpdater.checkForUpdates();

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