var os = require("os");
var path = require('path');
var fs = require('fs')
var ini = require('ini')
const logger = require('electron-log')

var createInit = {
    init: function () {
        //创建用户配置文件夹
        if(os.platform() == "win32"){

            this.createCfg();
        }
    },
    createCfg: function () {   //创建配置文件

        var appdata = require('electron').app.getPath("userData")
        var scanCfg = path.join(appdata, "scanCfg.ini");
        var default_pic = path.join(appdata, 'pictures');
        if(!fs.existsSync(default_pic)){
            fs.mkdirSync(default_pic);
        }
        if (!fs.existsSync(scanCfg)) {
            logger.info("scanCfg is no exist, now to create");
            fs.writeFileSync(scanCfg,"");
            var config = ini.parse(fs.readFileSync(scanCfg, 'utf-8'))
            config.general = {
                picture: default_pic
            }
            fs.writeFileSync(scanCfg, ini.stringify(config));
        }
    }
}
module.exports = createInit;