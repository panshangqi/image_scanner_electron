
const {shell, remote, ipcRenderer} = require('electron');
const {dialog} = require('electron').remote;
var cmd=require('node-cmd');
var path = require("path");
var ini = require("ini");
var fs = require("fs");
var fileDialog = require('file-dialog')
var nwDialog = require('nw-dialog')
lib_path = path.join(__dirname, './');
//var hello = require('./hello')
//----------------------
var $yes_no_update_dialog = $('#yes_no_update_dialog');

$('#login_btn').click(function () {
    var path1 = "D:\\C_GitLab\\pc_scaner_scansnap\\Release";
    //shell.openItem(path1);

    //clearEngine(['123','555']);
    var twainPath = remote.getGlobal('sharedObject').lib_path + "TwainDriver.exe 0";
    console.log(twainPath);
    cmd.get(
        twainPath,
        function(data){
            console.log("scan over...")
        }
    )
})
$('#static_btn').click(function () {
    console.log(remote.getGlobal('sharedObject').lib_path);
    console.log(process);
    console.log(remote.school);
})
$('#http_get_btn').click(function () {

    var url = 'http://10.200.4.226:8888/123456';
    var data = {
        username:'123456',
        passport:'123456'
    }
    yq.http.get(url,data,function(res){
        console.log(res);
    })
})
$('#http_post_btn').click(function () {

    var url = 'http://10.200.4.226:8888/123456';
    var _data = {
        username:'admin',
        passport:'admin'
    }
    yq.http.post(url,_data,function(res){
        console.log(res);
    })
})
$('#msg_1').click(function () {
    ipcRenderer.send('asynchronous-message', 'ping')
})
//----------软件更新
$('#check_update_btn').click(function () {
    ipcRenderer.send('message-check-for-update', 'start')
})
$('#to_update_btn').click(function () {
    ipcRenderer.send('message-update-start-download', 'start')
    $('#cencel_update_btn').hide();
    $('#to_update_btn').hide();
    $('#update_progress').show();
})
$('#to_install_btn').click(function () {
    ipcRenderer.send('message-update-start-install')
})
function initDefaultPicInput(){
    var appdata = require('electron').remote.app.getPath("userData")
    var scanCfg = path.join(appdata, "scanCfg.ini");
    console.log(scanCfg);
    if(fs.existsSync(scanCfg)){
        var config = ini.parse(fs.readFileSync(scanCfg, 'utf-8'))
        var default_pic = config.path.picture;
        console.log(default_pic);
        $('#show_default_pic').val(default_pic);
    }
}
initDefaultPicInput();
$('#select_default_pic_btn').click(function () {

    var appdata = require('electron').remote.app.getPath("userData")
    var scanCfg = path.join(appdata, "scanCfg.ini");
    var dirPath = dialog.showOpenDialog({
        properties: ['openDirectory'],
        defaultPath: "C:\\"
    })
    dirPath = dirPath[0];
    var config = ini.parse(fs.readFileSync(scanCfg, 'utf-8'))
    config.path = {
        "picture": dirPath
    }
    fs.writeFileSync(scanCfg, ini.stringify(config));
    $('#show_default_pic').val(dirPath);
})

ipcRenderer.on('message-update-available', function (event, data) {
    console.log('message-update-available')
    $yes_no_update_dialog.modal({
        show:true,
        keyboard:false,
        backdrop:"static"
    });
})
ipcRenderer.on('message-download-progress', function (event, data) {
    var _width = 0;
    if(data){
        if(data.percent) {
            _width = Math.ceil(data.percent) + '%';
            $('#dl_tip_progress').html(_width);
        }
        if(data.bytesPerSecond){
            var _speed = parseInt(data.bytesPerSecond/1000.0);
            $('#dl_tip_speed').html(_speed);
        }
    }

    $('#update_progress').find('.progress-bar').css({
        'width':_width
    })
})
ipcRenderer.on('message-download-end', function (event) {
    $('#to_install_btn').show();
    $('#update_progress').find('.progress-bar').css({
        'width':'100%'
    })
    $('#dl_tip_progress').html('100%');
})
//--------软件更新

ipcRenderer.on("update-message-call", (event, text) => {
    console.log(text);
    $('#update_progress').append(text + '<br/>');
});

const webview = document.getElementById('foo')
webview.addEventListener('new-window', (e) => {
    const protocol = require('url').parse(e.url).protocol
    if (protocol === 'http:' || protocol === 'https:') {
    //shell.openExternal(e.url)
    window.open(e.url)
}
});