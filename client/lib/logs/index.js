var colors = require('colors');
var logs = {
    log:function(msg){
        console.log(msg.green)
    },
    error:function (msg) {
        console.log(msg.red)
    },
    warn:function (msg) {
        console.log(msg.yellow)
    }
}
module.exports = logs;