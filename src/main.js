const {app, Tray,Menu, BrowserWindow, ipcMain} = require('electron')
const log = require('electron-log')
require('electron-reload')(__dirname);
var path = require("path")
const html_path = path.join(__dirname, './html/');
const img_path = path.join(__dirname, './img/');
const static_path = path.join(__dirname, './');

const autoUpdater = require('electron-updater').autoUpdater
// 在主进程里
global.sharedObject = {
    lib_path: path.join(__dirname, './lib/')
};
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
const uploadUrl='http://www.pansq.info:8081/download/'
//const uploadUrl='http://127.0.0.1:8081/download/'
//const uploadUrl='http://10.200.3.16:8081/download/'
//const uploadUrl = 'http://10.200.4.232:10010/download/'
// 检测更新，在你想要检查更新的时候执行，renderer事件触发后的操作自行编写

let win = null;
let tray = null;

function createWindow () {
    // 创建浏览器窗口。
    win = new BrowserWindow({width: 1500, height: 800, frame: true})
    //win.loadURL('https://www.baidu.com');

    // 然后加载应用的 index.html。
    win.loadFile(html_path + 'index.html')
    //win.loadURL('https://electronjs.org/');
    log.info('success load html: ' + html_path + 'index.html')
    // 打开开发者工具
    win.webContents.openDevTools()

    // 当 window 被关闭，这个事件会被触发。
    win.on('closed', () => {
        // 取消引用 window 对象，如果你的应用支持多窗口的话，
        // 通常会把多个 window 对象存放在一个数组里面，
        // 与此同时，你应该删除相应的元素。
        win = null
    })

    eventHandle();

}
// 主进程监听渲染进程传来的信息
updateHandle();
function eventHandle(){
    ipcMain.on('asynchronous-message', (event, arg) => {
        log.info(arg)
        win.loadFile(html_path + 'index.html')
    })

    ipcMain.on('message-check-for-update', (e, arg) => {
        autoUpdater.checkForUpdates();
    });
    ipcMain.on('message-update-start-download', (e, arg) => {
        autoUpdater.downloadUpdate();
    });
    ipcMain.on('message-update-start-install', (e, arg) => {
        autoUpdater.quitAndInstall();
    });
}
function updateHandle() {  //软件更新检测

        let message = {
            error: 'check update error',
            checking: 'checking update ...',
            updateAva: 'checked laster version, downloading ...',
            updateNotAva: 'the version is laster',
        };
        autoUpdater.autoDownload = false;
        autoUpdater.setFeedURL(uploadUrl);


        autoUpdater.on('error', function (error) {
            log.info(message.error)
        });
        autoUpdater.on('checking-for-update', function () {
            log.info(message.checking)

        });
        autoUpdater.on('update-available', function (info) {
            log.info(message.updateAva);
            sendMessageToRender('message-update-available', null);
        });
        autoUpdater.on('update-not-available', function (info) {
            log.info(message.updateNotAva)
        });
        // 更新下载进度事件
        autoUpdater.on('download-progress', function(progressObj) {
            log.info(progressObj);
            sendMessageToRender('message-download-progress', progressObj);
        })
        autoUpdater.on('update-downloaded', function (event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) {
            //win.webContents.send('downloadProcess', 'checkUpdate');
            log.info("start update install");
                //some code here to handle event
            sendMessageToRender('message-download-end');
        });

}
function sendStatusToWindow(text) {
    log.info(text);
    win.webContents.send('update-message-call', text);
}
function sendMessageToRender(_event,_data){
    win.webContents.send(_event, _data);
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
    log.info('success load tray: ' + img_path + 'ImageScanner.ico')
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