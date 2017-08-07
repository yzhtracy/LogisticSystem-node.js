/**
 * Created by yzh on 2017/8/3.
 */
var mysql = require('mysql');
var cfg = require('../conf/cfg.js');
var lib = require('../lib.js');

//使用链接池,提升性能
var pool = lib.getPool();

var msg = function(code, msg, data){
    this.code = code;
    this.msg = JSON.stringify(msg);
    this.data = data;
};

module.exports={
    queryStatistic:function (req,res,next) {
        if(req.session.user.permission != 1&&req.session.user.permission != 2){
            res.json(new msg(-1,""));
            return;
        }
        pool.getConnection(function (err,connection) {
            if (err) {
                res.json(new msg(-1,""));
                throw  err;
            }
            var id = parseInt(req.body.id);

            var sqlString = id==0?'':'where ? = ?';
            var startResult = new Array();//发货量的数据结果
            var endResult = new Array();  //收货量的数据结果
            var exceptionResult = new Array();//异常的数据结果
            var stringWithDate = function (changeDate) {
                return  changeDate.getFullYear()+'年'+changeDate.getMonth()+'月'+changeDate.getDate()+'日';
            }
            //根据数据库的查询结果创建最近七天的数量数组，没有则加0
             var createDataArray = function(result) {
                var nowDate = new Date();
                var nowTime = nowDate.getTime();
                var j = 0;
                var ResultArray = [];
                for(var i = 0;i<7;i++){
                     var beforetime = nowTime - 86400000*i;
                    var beforeDate = stringWithDate(new Date(beforetime));
                    var ResultDate = result.length==0?'':stringWithDate(new Date(result[j].time));
                     console.log(i+'bDate='+beforeDate+'rDate='+ResultDate);
                     var resultObj = {};
                    resultObj.dateStr = beforeDate;
                    resultObj.count = 0;
                    ResultArray[i] = resultObj;
                     if(beforeDate == ResultDate){
                         resultObj.count = result[j].count;
                         j++;
                     }
                 }
                 return ResultArray;
            }
            //判断是否所有查询结果都已返回，全部完成后拼接数据并返回
            var resultComplete = function () {
                if(startResult.length>0&&endResult.length>0&&exceptionResult.length>0){
                    var data = new msg(0, '成功', {startResult:startResult,endResult:endResult,exceptionResult:exceptionResult});
                    res.json(data);
                    connection.release();
                }
            }

            connection.query('select count(*) as count,date(createTime) as time from orders '+sqlString+' group by date(createTime) order by date(createTime) DESC LIMIT 0,7;',['startAddressID',id], function(err, result){
                if(err){
                    res.json(new msg(-1,""));
                    connection.release();
                    return
                }else {
                    startResult = createDataArray(result);
                    resultComplete();

                }
            });
            connection.query('select count(*) as count,date(createTime) as time from orders '+sqlString+' group by date(createTime) order by date(createTime) DESC LIMIT 0,7;',['endAddressID',id], function(err, result){
                if(err){
                    res.json(new msg(-1,""));
                    connection.release();
                    return
                }else {
                    endResult = createDataArray(result);
                    resultComplete();
                }
            });
            connection.query('select count(*) as count,date(createTime) as time from orders where '+'(endAddressID = ? or startAddressID = ?) AND '+'`status` = 6 group by date(createTime) order by date(createTime) DESC LIMIT 0,7;',[id,id], function(err, result){
                if(err){
                    res.json(new msg(-1,"异常数查询出错"));
                    connection.release();
                    return
                }else {
                    exceptionResult = createDataArray(result);
                    resultComplete();
                }
            });

        });

    }

}