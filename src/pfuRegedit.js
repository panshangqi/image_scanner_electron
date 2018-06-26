
var regedit = require('regedit'); //引入regedit
var path = require('path');
var fs = require('fs')
var ini = require('ini')
var cmd = require('node-cmd');
const logger = require('electron-log')
const { exec } = require('child_process');

var runPfu = {
    exeDir: path.resolve(__dirname, '..'),
    init: function(){
        this.initPfuRegedit();
        logger.info(this.exeDir);
    },
    initPfuRegedit: function () {

        var exebuf = path.join(this.exeDir,'ScanSnap.exe');
        var inibuf = path.join(this.exeDir,'ScanSnap.ini');
        var dirbuf = this.exeDir;
        var _this = this;
        if(this.isOSWin64()){
            regedit.list('HKLM\\Software\\WOW6432Node\\PFU\\ScanSnap Extension',function(err,result){
                if(!err){
                    regedit.createKey("HKLM\\Software\\WOW6432Node\\PFU\\ScanSnap Extension\\ScanTo17zy", function(err) {
                        if(!err){
                            regedit.putValue({
                                "HKLM\\Software\\WOW6432Node\\PFU\\ScanSnap Extension\\ScanTo17zy":{
                                    'Config':{
                                        value:inibuf,
                                        type:'REG_EXPAND_SZ'
                                    },
                                    'Path':{
                                        value:dirbuf,
                                        type:'REG_EXPAND_SZ'
                                    },
                                    'default':{
                                        value:exebuf,
                                        type:'REG_DEFAULT'
                                    }
                                }
                            },function(err){
                                if(!err){
                                    _this.getPfuSsMonExePath();
                                }
                            })

                        }
                    })
                }
            })
        }
        else{
            regedit.list('HKLM\\Software\\PFU\\ScanSnap Extension',function(err,result){
                if(!err){
                    regedit.createKey("HKLM\\Software\\PFU\\ScanSnap Extension\\ScanTo17zy", function(err) {
                        regedit.putValue({
                            "HKLM\\Software\\PFU\\ScanSnap Extension\\ScanTo17zy":{
                                'Config':{
                                    value:inibuf,
                                    type:'REG_EXPAND_SZ'
                                },
                                'Path':{
                                    value:dirbuf,
                                    type:'REG_EXPAND_SZ'
                                },
                                'default':{
                                    value:exebuf,
                                    type:'REG_DEFAULT'
                                }
                            }

                        },function(err){
                            console.log(err);
                        })
                    })
                }

            })
        }
    },
    getPfuSsMonExePath: function () {
        var data_Set = 'HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\App Paths\\PfuSsMon.exe';
        var _this = this;
        regedit.list(data_Set,function(err,result){
            if(result){
                var exePath = result[data_Set].values[''].value;
                if(fs.existsSync(exePath)){
                    _this.setPfuSsMonCfg();
                    logger.info(exePath);
                    exePath = '"' + exePath + '"';
                    exec(exePath,{},function(err,data){
                        logger.info('start Scansnap pfu exe');
                    });
                }
            }
            else{
                logger.info('can not find PfuMonexePath');
            }
        })
    },
    setPfuSsMonCfg: function () {
        var appdata = require('electron').app.getPath("userData")
        var pfu_cache = path.join(appdata, '..');
        pfu_cache = path.join(pfu_cache, 'PFU/ScanSnap');
        //为17zy创建id
        var appIDCfg = path.join(pfu_cache, 'AppID.cfg')
        if(fs.existsSync(appIDCfg)){
            var config = ini.parse(fs.readFileSync(appIDCfg, 'utf-8'))
            config.APPID['270'] = 'ScanTo17zy';
            fs.writeFileSync(appIDCfg, ini.stringify(config));
        }
        var pfuSsMon32 = path.join(pfu_cache, 'PfuSsMon32.cfg')
        if(fs.existsSync(pfuSsMon32)){
            var config = ini.parse(fs.readFileSync(pfuSsMon32, 'utf-8'))
            config.CONFIG_M.SbAppID = '270';
            config.CONFIG_C.ScanSnapMenu = '0';
            config.CONFIG_C.ConfigIndex = '0';
            fs.writeFileSync(pfuSsMon32, ini.stringify(config));
        }
    },
    isOSWin64: function () {
        return process.arch === 'x64' || process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432');
    }
}
module.exports = runPfu;