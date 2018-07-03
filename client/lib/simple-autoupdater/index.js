var request = require('request')
var request_progress = require('request-progress')
var path = require('path')

var fs = require('fs')
var EventEmitter = require('events').EventEmitter
class SimpleAutoUpdater {
    constructor(){
        this.event = new EventEmitter();
        this.app = require('electron').app;
        this.cache_dir = this.app.getPath("userData")
        this.url = null;
        this.json_url = null;
        this.install_url = null;   //update package url
        this.version = this.app.getVersion();
    }
    setUrl(_url) {
        this.url = _url;
    }
    getUrl(){
        return this.url;
    }

    checkUpdate(){
        var _url = this.url + 'update.json';
        var _this = this;
        var local_update_json = path.join(this.cache_dir, 'update.json');
        request(_url, function (error, response, body) {

            if(body){
                console.log(body);
                var res = JSON.parse(body);
                _this.install_url = _this.url + res.install;
                if(_this.compareVersion(res.version, _this.app.getVersion()) > 0){
                    //有新版本
                    _this.event.emit('update-available')
                }else{
                    //未发现新版本
                    _this.event.emit('update-not-available')
                }
            }
        }).pipe(fs.createWriteStream(local_update_json))
    }

    downloadUpdate(){
        if(this.install_url){
            var _this = this;
            console.log('start download');
            var filename = 'installer_' + this.version + '.exe';
            var local_install_path = path.join(this.cache_dir, filename);
            //this.install_url = 'https://codeload.github.com/panshangqi/panEasyUI/zip/master';
            request_progress(request(this.install_url), {
                // throttle: 2000,                    // Throttle the progress event to 2000ms, defaults to 1000ms
                // delay: 1000,                       // Only start to emit after 1000ms delay, defaults to 0ms
                // lengthHeader: 'x-transfer-length'  // Length header to use, defaults to content-length
            }).on('progress', function (state) {
                    // The state is an object that looks like this:
                    // {
                    //     percent: 0.5,               // Overall percent (between 0 to 1)
                    //     speed: 554732,              // The download speed in bytes/sec
                    //     size: {
                    //         total: 90044871,        // The total payload size in bytes
                    //         transferred: 27610959   // The transferred payload size in bytes
                    //     },
                    //     time: {
                    //         elapsed: 36.235,        // The total elapsed seconds since the start (3 decimals)
                    //         remaining: 81.403       // The remaining seconds to finish (3 decimals)
                    //     }
                    // }
                _this.event.emit('download-progress', state);
            })
            .on('error', function (err) {
                // Do something with err
                _this.event.emit('download-error');
            })
            .on('end', function () {
                // Do something after request finishes
                _this.event.emit('download-end');
            })
            .pipe(fs.createWriteStream(local_install_path));
        }
    }

    compareVersion(net_version, local_version){
        console.log(net_version,local_version);
        var arr1 = net_version.split('.');
        var arr2 = local_version.split('.');
        var minL = Math.min(arr1.length, arr2.length);
        var pos = 0;
        var diff = 0;
        while(pos < minL){
            diff = parseInt(arr1[pos]) - parseInt(arr2[pos]);
            if(diff!=0){
                break;
            }
            pos++;
        }
        if(diff > 0)
            return 1;
        else if(diff == 0)
            return 0;
        return -1;
    }
}

module.exports = SimpleAutoUpdater;