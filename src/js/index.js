
const {shell, remote, ipcRenderer} = require('electron');
var cmd=require('node-cmd');
var path = require("path");
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
//软件更新
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

ipcRenderer.on("update-message-call", (event, text) => {
    console.log(text);
    $('#update_progress').append(text + '<br/>');
});