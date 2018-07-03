
const {shell, remote, ipcRenderer} = require('electron');
const {dialog, BrowserWindow} = require('electron').remote;
const logger = require('electron-log')
var co = require('co');
var OSS = require('ali-oss')
var cmd=require('node-cmd');
var path = require("path");
var ini = require("ini");
var fs = require("fs");
var request = require("request");
const { exec } = require('child_process');
var yq_util = require('../js/yq_util')
var diskspace = require('diskspace')

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
    console.log(remote.getGlobal('appdata'));
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
    logger.info('http://10.200.4.226:8888/123456')
})
$('#http_post_upload_btn').click(function () {
    console.log('btn');

    var formData = {
        test:'fad15454k5451g21f5sd4g5',
        file: [
            {
                value:  fs.createReadStream('D:\\17zuoyePic\\7cd77ebbe3b4eba51c979bb23907974a_1.jpg'),
                options: {
                    filename: '7cd77ebbe3b4eba51c979bb23907974a_1.jpg',
                    contentType: 'image/jpeg'
                }
            },
            {
                value:  fs.createReadStream('D:\\17zuoyePic\\7cd77ebbe3b4eba51c979bb23907974a_2.jpg'),
                options: {
                    filename: '7cd77ebbe3b4eba51c979bb23907974a_2.jpg',
                    contentType: 'image/jpeg'
                }
            }
        ]
    };
    request.post({url:'http://10.200.4.226:8888/scan_stat/test', formData: formData}, function optionalCallback(err, httpResponse, body) {

        if (err) {
            return console.error('upload failed:', err);
        }
        console.log('Upload successful!  Server responded with:', body);
    }).then(()=>{
        console.log('upload file over');
    });
    console.log('upload file end');
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
$('#get_ali_key_btn').click(function () {
    var url = "http://10.200.3.16:3202/host/sts";

    yq.http.get(url,"",function (res) {
        res = JSON.parse(res);
        console.log(res.body.Credentials);
        console.log(res.body);
        var AccessKeyId = res.body.Credentials.AccessKeyId;
        var AccessKeySecret = res.body.Credentials.AccessKeySecret;
        var SecurityToken = res.body.Credentials.SecurityToken;
        var bucket = res.body.bucket;
        var endpoint = res.body.endpoint;
        var file_dir = res.body.file_dir;
        var client = new OSS.Wrapper({
            region: 'oss-cn-beijing',
            accessKeyId: AccessKeyId,
            accessKeySecret: AccessKeySecret,
            bucket: bucket
        });
        //异步
        client.put(file_dir+'7cd77ebbe3b4eba51c979bb23907974a_2.jpg', 'D:\\17zuoyePic\\7cd77ebbe3b4eba51c979bb23907974a_2.jpg').then(function (rep) {
            console.log(rep);
        }).catch(function (err) {
            console.log('error->:' + err);
        })
        /*同步
        co(function* () {
            var result = yield client.put(file_dir+'7cd77ebbe3b4eba51c979bb23907974a_2.jpg', 'D:\\17zuoyePic\\7cd77ebbe3b4eba51c979bb23907974a_2.jpg');
            console.log(result);
        }).catch(function (err) {
            console.log('error->:' + err);
        });
        */
    },true)

    console.log('get');
})
$('#get_disk_size_btn').click(function () {
    diskspace.check('I',function (err,result) {
        if(!err){
            console.log(result);
        }else{
            console.log(err);
        }
    })
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
        //console.log(e.url);
        window.open(e.url);

    }
});
const remote_web = document.getElementById('remote_web')
/*
remote_web.addEventListener('new-window', (e) => {
    const protocol = require('url').parse(e.url).protocol
    if (protocol === 'http:' || protocol === 'https:') {
    //shell.openExternal(e.url)
    console.log(e.url);
    //window.open(e.url);
    //window.location.href = e.url;
    $('#remote_web').attr('src',e.url);
}
});*/
$('#web_url').on('keypress',function(event){

    if(event.keyCode == 13)
    {
        console.log($('#web_url').val());
        var m_url = $('#web_url').val();
        $('#remote_web').attr('src', m_url);

    }

});
$('#remote_web').on('new-window',function (e) {
    console.log(e);
    e = e.originalEvent;

    const protocol = require('url').parse(e.url).protocol
    if (protocol === 'http:' || protocol === 'https:') {
        //shell.openExternal(e.url)
        console.log(e);
        //window.open(e.url);
        //window.location.href = e.url;
        $('#web_url').val(e.url)
        $('#remote_web').attr('src', e.url);
    }

})

//const webview = document.querySelector('webview')

webview.addEventListener('dom-ready', () => {
    //webview.openDevTools() //打开webview 控制台
})
