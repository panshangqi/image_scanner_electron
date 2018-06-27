
const {shell, remote, ipcRenderer} = require('electron');
const {dialog, BrowserWindow} = require('electron').remote;
var cmd=require('node-cmd');
var path = require("path");
var ini = require("ini");
var fs = require("fs");
const { exec } = require('child_process');
var yq_util = require('../yq_util')
var fileDialog = require('file-dialog')
var nwDialog = require('nw-dialog')
lib_path = path.join(__dirname, './');
//var hello = require('./hello')
//----------------------
var $yes_no_update_dialog = $('#yes_no_update_dialog');
var drive_setting_dialog = $('#drive_setting_dialog');

$('#scan_btn').click(function () {

    exec("TwainDriver.exe 0",{},function(err,data){
        console.info('TwainDrive 4');
    });
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

    var default_pic = yq_util.get_ini('picture');
    $('#show_default_pic').val(default_pic);
}
initDefaultPicInput();
$('#select_default_pic_btn').click(function () {

    var appdata = require('electron').remote.app.getPath("userData")
    var scanCfg = path.join(appdata, "scanCfg.ini");
    var dirPath = dialog.showOpenDialog({
        properties: ['openDirectory'],
        defaultPath: "C:\\"
    })
    if(dirPath){
        dirPath = dirPath[0];
        yq_util.set_ini("picture",dirPath)
        $('#show_default_pic').val(dirPath);
    }
})
$('#open_window_dialog_btn').click(function () {
    const {BrowserWindow} = require('electron').remote
    let win = new BrowserWindow({width: 800, height: 600})
    win.loadURL('https://github.com')
})
$('#drive_setting_btn').click(function () {
    drive_setting_dialog.modal('show');
    exec("TwainDriver.exe 4",{},function(err,data){
        console.info('TwainDrive 4');
    });
})
$('#set_default_drive_btn').click(function () {

    var drive_name = $('input:radio[name="drive_radio"]:checked').parents('label').find('span').html();
    if(!drive_name) {
        alert("请选择驱动");
        return;
    }
    console.log(drive_name);
    yq_util.set_ini('drive', drive_name);
    drive_setting_dialog.modal('hide');
})
$('#open_drive_setting_btn').click(function () {

    exec("TwainDriver.exe 2",{},function(err,data){
        console.info('TwainDrive 2');
    });
})
ipcRenderer.on('message-drive-list', function (event, data) {
    console.log('message-drive-list',data)
    var selected_drive = yq_util.get_ini('drive');
    console.log(selected_drive);
    if($.isArray(data))
    {
        data.unshift("ScanSnap IX500");

        var html = '';
        for(var i=0;i<data.length;i++){
            if(selected_drive == data[i])
                html += '<li><label><input type="radio" checked name="drive_radio"><span>' + data[i] + '</span></label></li>';
            else
                html += '<li><label><input type="radio" name="drive_radio"><span>' + data[i] + '</span></label></li>';
        }
        $('#drive_list_box').html(html);
    }
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