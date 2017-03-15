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
};