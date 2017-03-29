/**
 * Created by taoyi-third on 2017/3/23.
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
    //查询价格
    queryPrice:function (req,res,next) {
        pool.getConnection(function (err,connection) {
            if(err){
                throw err;
            }

            var data;
            connection.query('select * from price where id = 1',function (err,result) {
                var data;
                if(err){
                    data = new msg(-1,err);
                }
                if(result.length == 0){
                    data = new msg(-1,"数据库连接错误");
                }else {
                   data = new msg(0, '成功', {data: result});
                }
                res.json(data);
                //释放连接
                connection.release();
            });
        });
        //更改价格
    },changePrice:function (req,res,next) {
        if(req.session.user.permission != 1){
            res.json(new msg(-1,""));
            return;
        }

        pool.getConnection(function (err,connection) {
            if(err){
                throw err;
            };
            var cubePrice = parseFloat(req.body.cubePrice);
            var weightPrice = parseFloat(req.body.weightPrice);
            var minPrice = parseFloat(req.body.minPrice);
            connection.query('update price set cubePrice = ?,weightPrice = ?,minPrice = ? where id = "1";',[cubePrice,weightPrice,minPrice],function(err, result) {
                var data;
                if (err) {
                    data = new msg(-1, err);
                } else {
                    data = new msg(0, "成功");
                    // req.session.user = result[0];
                }
                res.json(data);
                connection.release();
            });
        });
      //查询城市表
    },getLogisticAddress:function (req,res,next) {
        pool.getConnection(function (err,connection) {
            connection.query('select * from chinaCity',function (err,result) {
                var data;
                if(err){
                    data = new msg(-1,err);
                }else {
                    data = new msg(0,"成功",{data:result});
                }
                res.json(data);
                connection.release();
            })
        })
        //添加站点
    },addAddress:function (req,res,next) {
        if(req.session.user.permission != 1){
            res.json(new msg(-1,""));
            return;
        }
        pool.getConnection(function (err,connection) {
            if (err) {
                throw err;
            };
            var timestamp = new Date();
            var volume = parseFloat(req.body.volume);
            var id = parseInt(req.body.id);
            connection.query('update chinaCity set status = 1 ,volume = ? ,opentime= ? where id = "?";',[volume,timestamp,id],function (err,result) {
                var data;
                if (err) {
                    data = new msg(-1, err);
                } else {
                    data = new msg(0, "成功");
                    // req.session.user = result[0];
                }
                res.json(data);
                connection.release();
            })
        });
        //修改容积
    },changeAddress:function (req,res,next) {
        if(req.session.user.permission != 1){
            res.json(new msg(-1,""));
            return;
        }
        pool.getConnection(function (err,connection) {
            if (err) {
                throw err;
            };
            var volume = parseFloat(req.body.volume);
            var id = parseInt(req.body.id);
            connection.query('update chinaCity set status = 1 ,volume = ?  where id = "?";',[volume,id],function (err,result) {
                var data;
                if (err) {
                    data = new msg(-1, err);
                } else {
                    data = new msg(0, "成功");
                    // req.session.user = result[0];
                }
                res.json(data);
                connection.release();
            })
        });
    },//删除站点
    deleteAddress:function (req,res,next) {
        if(req.session.user.permission != 1){
            res.json(new msg(-1,""));
            return;
        }
        pool.getConnection(function (err,connection) {
            if (err) {
                throw err;
            };
            var id = parseInt(req.body.id);
            connection.query('update chinaCity set status = 0 where id = "?";',[id],function (err,result) {
                var data;
                if (err) {
                    data = new msg(-1, err);
                } else {
                    data = new msg(0, "成功");
                    // req.session.user = result[0];
                }
                res.json(data);
                connection.release();
            })
        });
    }
    ,//查询站点表
    queryAddress:function (req,res,next) {
        pool.getConnection(function (err,connection) {
            var start = parseInt(req.body.start);
            var length = parseInt(req.body.length);
            connection.query('select * from chinaCity where status = 1 limit ?,?',[start,length],function (err,result) {
                if(err){
                    console.log("数据库链接失败  start="+start+"length=="+length);
                    return res.json(new msg(-1, err));
                }
                //查询一共有多少条记录
                connection.query('select count(1) from chinaCity where status = 1', [], function(err, result2) {
                    res.json(new msg(0, '', {count: result2[0]['count(1)'], data: result}));
                });
                // 释放连接
                connection.release();
            })
        })
    }

}