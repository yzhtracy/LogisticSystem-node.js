/**
 * Created by taoyi-third on 2017/3/14.
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

module.exports = {
    login:function (req,res,next) {
        pool.getConnection(function (err,connection) {
            if(err){
                throw err;
            };

            var username = req.body.username;
            var password = req.body.password;

            connection.query('select * from users where username = ? and password = ?',[username,password],function(err, result){
                var data;
                if(err){
                    data = new msg(-1,err);
                };
                if(result.length == 0){
                    data  = new msg(-1,"用户名或密码错误!");
                }else {
                    data = new msg(0,"成功");
                    req.session.user = result[0];
                }
                res.json(data);
                // 释放连接
                connection.release();
            });
        })
    },
    register:function (req,res,next) {
        pool.getConnection(function (err,connection) {
            if(err){
                throw err;
            };

            var username = req.body.username;
            var password = req.body.password;
            connection.query('select * from users where username = ?',[username],function(err, result){
                var data;
                if(err){
                    data = new msg(-1,err);
                };
                if(result.length != 0){
                    data  = new msg(-1,"该手机号码已被注册!");
                    res.json(data);
                }else {
                    connection.query('INSERT INTO users (username, password, permission) VALUES (?, ?, "3");',[username,password],function(err, result){
                        var data;
                        if(err){
                            data = new msg(-1,err);
                        }else {
                            data = new msg(0,"成功");
                            req.session.user = result[0];
                        }
                        res.json(data);
                    });
                }
                // 释放连接
                connection.release();
            });

        })
    },
    resetPassword:function (req,res,next) {
        pool.getConnection(function (err,connection) {
            if(err){
                throw err;
            };

            var username = req.body.username;
            var password = req.body.password;
            connection.query('select * from users where username = ?',[username],function(err, result){
                var data;
                if(err){
                    data = new msg(-1,err);
                };
                if(result.length == 0){
                    data  = new msg(-1,"该手机号码还未注册!");
                    res.json(data);
                }else {
                    connection.query('update users set password = ? where username = ?;',[password,username],function(err, result){
                        var data;
                        if(err){
                            data = new msg(-1,err);
                        }else {
                            data = new msg(0,"成功");
                            // req.session.user = result[0];
                        }
                        res.json(data);
                    });
                }
                // 释放连接
                connection.release();
            });

        })
    },
    logout: function(req, res, next){
        req.session.user = null;
        res.json(new msg(0, "成功"));
    },
    query:function (req, res, next,user) {
        console.log("用户的权限是====="+user.permission);
        if(user.permission != 1){
            data = new msg(-1,"");
        }
        pool.getConnection(function (err,connection) {
            if(err){
                throw err;
            };
            
            var start = parseInt(req.body.start);
            var length = parseInt(req.body.length);
            //搜索符合条件的数据
            connection.query('select * from users limit ?,?',[start, length], function(err, result) {
                if(err){
                    console.log("数据库链接失败  start="+start+"length=="+length);
                    return res.json(new msg(-1, err));
                }
                //查询一共有多少条记录
                connection.query('select count(1) from users', [], function(err, result2) {
                    res.json(new msg(0, '', {count: result2[0]['count(1)'], data: result}));
                });
                // 释放连接
                connection.release();
            });
        });
    }
};