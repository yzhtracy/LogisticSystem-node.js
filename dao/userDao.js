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
    //登录
    login:function (req,res,next) {
        pool.getConnection(function (err,connection) {
            if(err){
                throw err;
            };

            var username = req.body.username;
            var password = req.body.password;

            connection.query('select * from users where username = ? and password = ? and status = 1',[username,password],function(err, result){
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
    //注册
    register:function (req,res,next) {
        pool.getConnection(function (err,connection) {
            if(err){
                throw err;
            };

            var username = req.body.username;
            var password = req.body.password;
            connection.query('select * from users where username = ? and status = 1',[username],function(err, result){
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
                        }
                        res.json(data);
                    });
                }
                // 释放连接
                connection.release();
            });

        })
    },
    //重置密码
    resetPassword:function (req,res,next) {
        pool.getConnection(function (err,connection) {
            if(err){
                throw err;
            };

            var username = req.body.username;
            var password = req.body.password;
            connection.query('select * from users where username = ? and status = 1',[username],function(err, result){
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
    //退出登录
    logout: function(req, res, next){
        req.session.user = null;
        res.json(new msg(0, "成功"));
    },
    //查询用户表
    query:function (req, res, next,user) {
        console.log("用户的权限是====="+user.permission);
        if(user.permission != 1){
            res.json(new msg(-1,""));
            return;
        }
        pool.getConnection(function (err,connection) {
            if(err){
                throw err;
            };
            
            var start = parseInt(req.body.start);
            var length = parseInt(req.body.length);
            //搜索符合条件的数据
            connection.query('select * from users where status = 1 limit ?,?',[start, length], function(err, result) {
                if(err){
                    console.log("数据库链接失败  start="+start+"length=="+length);
                    return res.json(new msg(-1, err));
                }
                //查询一共有多少条记录
                connection.query('select count(1) from users where status = 1', [], function(err, result2) {
                    res.json(new msg(0, '', {count: result2[0]['count(1)'], data: result}));
                });
                // 释放连接
                connection.release();
            });
        });
    },
    //添加用户
    addUser:function (req,res,next,user) {
        //判断用户的权限
        if(user.permission != 1){
            res.json(new msg(-1,""));
            return;
        }
        pool.getConnection(function (err,connection) {
            if(err){
                throw err;
            };

            var permission = parseInt(req.body.permission);
            var username = req.body.username;
            var password = req.body.password;
            //搜索名字是否占用
            connection.query('select * from users where username = ? and status = 1',[username],function(err, result){
                var data;
                if(err){
                    data = new msg(-1,err);
                };
                if(result.length != 0){
                    data  = new msg(-1,"用户名已经存在!");
                    res.json(data);
                }else {
                    connection.query('INSERT INTO users (username, password, permission) VALUES (?, ?, ?);',[username,password,permission],function(err, result){
                        var data;
                        if(err){
                            data = new msg(-1,err);
                        }else {
                            data = new msg(0,"成功");
                        }
                        res.json(data);
                    });
                }
                // 释放连接
                connection.release();
            });
        });
    },
    //编辑用户
    editUser:function (req,res,next,user) {
        //判断用户的权限
        if(user.permission != 1){
            res.json(new msg(-1,""));
            return;
        }
        pool.getConnection(function (err,connection) {
            if(err){
                throw err;
            };

            var permission = parseInt(req.body.permission);
            var userID = req.body.userID;
            var password = req.body.password;
            connection.query('update users set password = ?,permission=? where id = ?;',[password,permission,userID],function(err, result){
                var data;
                if(err){
                    data = new msg(-1,err);
                }else {
                    data = new msg(0,"成功");
                    // req.session.user = result[0];
                }
                res.json(data);
            });

        });
    },
    //删除用户
    deleteUser:function (req,res,next,user) {
        //判断用户的权限
        if(user.permission != 1){
            res.json(new msg(-1,""));
            return;
        }
        pool.getConnection(function(err, connection) {
            if(err){
                throw err;
            }
            var ids = req.body.ids;
            connection.query('update users set status=0 where id in ('+ids+')', [], function(err, result) {
                if(err){
                    return res.json(new msg(-1, err));
                }
                res.json(new msg(0, ''));
                connection.release();
            });
        });
    }
};