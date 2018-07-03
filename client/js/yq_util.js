
var path = require('path')
var fs = require('fs')
var ini = require('ini')

var yq_util = {
    appdata: require('electron').remote.app.getPath("userData"),
    set_ini:function (key,value) {
        var scanCfg = path.join(this.appdata, "scanCfg.ini");
        if (fs.existsSync(scanCfg)) {

            var config = ini.parse(fs.readFileSync(scanCfg, 'utf-8'))
            config.general[key] = value;
            fs.writeFileSync(scanCfg, ini.stringify(config));
        }
    },
    get_ini:function (key) {

        var scanCfg = path.join(this.appdata, "scanCfg.ini");
        if (fs.existsSync(scanCfg)) {
            var config = ini.parse(fs.readFileSync(scanCfg, 'utf-8'))
            if(config.general)
                return config.general[key];
            return null;
        }
        return null;
    }
}
module.exports = yq_util;