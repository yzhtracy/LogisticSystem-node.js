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
            var sqlString = function (str) {
                return id==0?'':'where '+str+' = ?';
            }
            var startResult = new Array();//发货量的数据结果
            var endResult = new Array();  //收货量的数据结果
            var exceptionResult = new Array();//异常的数据结果
            var cityResult = [];//站点结果

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
                     var resultObj = {dateStr:beforeDate,count:0};
                    ResultArray[i] = resultObj;
                     if(beforeDate == ResultDate){
                         resultObj.count = result[j].count;
                         j++;
                     }
                 }
                 return ResultArray;
            }
            //查询可用站点及编号，第一个手动插入全部
            var createCityArray = function (result) {
                for(var i = 0;i<=result.length;i++){
                    var cityObj = {};
                    if(i==0){
                        cityObj.id = 0;
                        cityObj.name = '所有站点';
                    }else {
                        cityObj.id = result[i-1].id;
                        cityObj.name = result[i-1].province+result[i-1].city+result[i-1].conunty;
                    }
                    cityResult[i] = cityObj;
                }
                return cityResult;
            }
            var volumeData;
            //判断是否所有查询结果都已返回，全部完成后拼接数据并返回
            var resultComplete = function () {
                if(startResult.length>0&&endResult.length>0&&exceptionResult.length>0&&cityResult.length>0&&volumeData){
                    var data = new msg(0, '成功', {startResult:startResult,endResult:endResult,exceptionResult:exceptionResult,cityResult:cityResult,volumeData:volumeData});
                    res.json(data);
                    connection.release();
                }
            }

            connection.query('select count(*) as count,date(createTime) as time from orders '+sqlString('startAddressID')+' group by date(createTime) order by date(createTime) DESC LIMIT 0,7;',[id], function(err, result){
                if(err){
                    res.json(new msg(-1,""));
                    connection.release();
                    return
                }else {
                    startResult = createDataArray(result);
                    resultComplete();
                }
            });
            connection.query('select count(*) as count,date(createTime) as time from orders '+sqlString('endAddressID')+' group by date(createTime) order by date(createTime) DESC LIMIT 0,7;',[id], function(err, result){
                if(err){
                    res.json(new msg(-1,""));
                    connection.release();
                    return
                }else {
                    endResult = createDataArray(result);
                    resultComplete();
                }
            });
            var str = id==0?'':'(endAddressID = ? or startAddressID = ?) AND';
            connection.query('select count(*) as count,date(createTime) as time from orders where '+str+'`status` = 6 group by date(createTime) order by date(createTime) DESC LIMIT 0,7;',[id,id], function(err, result){
                if(err){
                    res.json(new msg(-1,"异常数查询出错"));
                    connection.release();
                    return
                }else {
                    exceptionResult = createDataArray(result);
                    resultComplete();
                }
            });
            connection.query('select * from chinaCity where status = 1',[],function (err,result) {
                if(err){
                    return res.json(new msg(-1, err));
                }
                cityResult = createCityArray(result);
                resultComplete();
            })
            var volumeStr = id==0?'? >= 0':'endAddressID = ?';
            connection.query('SELECT SUM(case when c.`status` < 4 then o.volume ELSE 0 end) normal,SUM(case when c.`status` > 4 then o.volume ELSE 0 end) abnormality,SUM(c.volume) total FROM orders o JOIN chinaCity c ON o.startAddressID = c.id WHERE '+volumeStr+';',[id],function (err,result) {
                if(err){
                    return res.json(new msg(-1, '查询体积时出错'));
                }
                result = result[0];
                result.usable = result.total - result.normal -result.abnormality;
                volumeData = result;
                resultComplete();
            })
        });

    }

}