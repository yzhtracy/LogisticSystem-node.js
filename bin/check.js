/**
 * Created by taoyi-third on 2017/3/17.
 */

//崩溃自动重启程序
var exec = require("child_process").exec;
check();
function check() {
    last = exec("lsof -i:3000");
    last.on("exit",function (code) {
        if(code !='0'){
            console.log('主服务已经关闭,正在重启....');
            run();
        }else {
            console.log('主服务器正常运行中');
        }
    });
    setTimeout(check,5000);
}

function run() {
    last = exec("node www");
    last.on('exit',function (code) {
        if(code == "0"){
            console.log("主服务已经启动成功");
        }else {
            console.log("主服务启动失败");
        }
    })
}