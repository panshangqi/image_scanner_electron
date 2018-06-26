
const {app, Tray,Menu, BrowserWindow, ipcMain} = require('electron')
const runPfu = require('./pfuRegedit')
const create_init = require('./create_init')
const logger = require('electron-log')
const date = require('date-and-time')
const fs = require('fs')
if(process.env.NODE_ENV === 'development') {
    require('electron-reload')(__dirname);
}
var path = require("path")
const html_path = path.join(__dirname, './html/');
const img_path = path.join(__dirname, './img/');
const static_path = path.join(__dirname, './');

const autoUpdater = require('electron-updater').autoUpdater
// 在主进程里
global.sharedObject = {
    lib_path: path.join(__dirname, './lib/'),
    root_dir: __dirname
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
    setupLogger();
    create_init.init();
    win = new BrowserWindow({width: 1500, height: 800, frame: true})
    //win.loadURL('https://www.baidu.com');

    // 然后加载应用的 index.html。
    win.loadFile(html_path + 'index.html')
    //win.loadURL('https://electronjs.org/');
    logger.info('success load html: ' + html_path + 'index.html')
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
        logger.info(arg)
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
            logger.info(message.error)
        });
        autoUpdater.on('checking-for-update', function () {
            logger.info(message.checking)

        });
        autoUpdater.on('update-available', function (info) {
            logger.info(message.updateAva);
            sendMessageToRender('message-update-available', null);
        });
        autoUpdater.on('update-not-available', function (info) {
            logger.info(message.updateNotAva)
        });
        // 更新下载进度事件
        autoUpdater.on('download-progress', function(progressObj) {
            logger.info(progressObj);
            sendMessageToRender('message-download-progress', progressObj);
        })
        autoUpdater.on('update-downloaded', function (event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) {
            //win.webContents.send('downloadProcess', 'checkUpdate');
            logger.info("start update install");
                //some code here to handle event
            sendMessageToRender('message-download-end');
        });

}
function sendStatusToWindow(text) {
    logger.info(text);
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
    logger.info('success load tray: ' + img_path + 'ImageScanner.ico')
}
// Electron 会在初始化后并准备
// 创建浏览器窗口时，调用这个函数。
// 部分 API 在 ready 事件触发后才能使用。
app.on('ready', () => {
    createWindow();
    createTray();
    runPfu.init();
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

//本地服务

var http = require('http');
var express = require('express');
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter)
db.defaults({image_files:[],user:[]}).write()

process.on('uncaughtException', function (err) {
    console.log(err);
});

var http_server  = express();
http_server.post('/drive_images', function (req, res) {
    console.log("post query");
    for(var i=0;i<1;i++){
        db.get('image_files').push({
            image_id:'image_'+i,
            size:13513,
            filename:'image_'+i+'.jpg',
            batch:'fadf0adfad'+i+'fasdfadfdsfs'
        }).write();
        console.log(i);
    }
    res.send({
        'username':'admin',
        'passport':'admin'
    });
});
http_server.get("/",function(req,res){
    console.log("Hello Electron Server")
    res.send("Hello Electron Server")
})
var server = http_server.listen(10082, function () {

    var host = server.address().address
    var port = server.address().port

    console.log("the local server http://%s:%s", host, port)

})


function setupLogger() {
    var appdata = app.getPath("userData")
    var log_cache = path.join(appdata, 'logs');
    if (!fs.existsSync(log_cache)) {
        fs.mkdirSync(log_cache);
    }
    var now = new Date();
    var logname = date.format(now, 'YYYY_MM_DD');
    console.log(logname);
    log_cache = path.join(log_cache, logname + '.log');

    logger.transports.file.level = true;
    logger.transports.console.level = true;
    // Same as for console transport
    logger.transports.file.level = 'info';
    //logger.transports.file.format = '[{h}:{i}:{s}:{ms}] {text}';

    // Set approximate maximum log size in bytes. When it exceeds,
    // the archived log will be saved as the log.old.log file
    logger.transports.file.maxSize = 5 * 1024 * 1024;

    // Write to this file, must be set before first logging
    logger.transports.file.file = log_cache;

    // fs.createWriteStream options, must be set before first logging
    logger.transports.file.streamConfig = {flags: 'ax+'};

    // set existed file stream
    logger.transports.file.stream = fs.createWriteStream((log_cache), {'flags': 'a'});
}
