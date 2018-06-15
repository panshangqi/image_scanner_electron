const {shell} = require('electron');
var cmd=require('node-cmd');
var path = require("path")
//var hello = require('./hello')
$('#login_btn').click(function () {
    var path1 = "D:\\C_GitLab\\pc_scaner_scansnap\\Release";
    //shell.openItem(path1);

    //clearEngine(['123','555']);
    cmd.get(
        'D:\\C_GitLab\\pc_scaner_scansnap\\Release\\TwainDriver.exe 0',
        function(data){
            console.log("scan over...")
        }
    )
})
$('#static_btn').click(function () {

    console.log(static_path);
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
