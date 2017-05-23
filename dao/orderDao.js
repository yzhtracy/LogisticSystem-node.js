/**
 * Created by taoyi-third on 2017/3/29.
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
    //查询可用站点及价格
    queryAddress:function (req,res,next) {
        pool.getConnection(function (err,connection) {
            connection.query('select * from chinaCity where status = 1',function (err,result) {
                var data;
                if(err){
                    data = new msg(-1,err);
                    res.json(data);
                    connection.release();
                }else {
                    connection.query('select * from price where id = 1',function (err,result2) {
                        if(err){
                            data = new msg(-1,err);
                            res.json(data);
                            connection.release();
                        }else {
                            console.log('成功');
                            data = new msg(0,"成功",{data:result,priceData:result2});
                            res.json(data);
                            connection.release();
                        }
                    });
                }

            })
        })
    },//提交订单信息
    createOrder:function (req,res,next) {
        if(!req.session.user){
            res.json(new msg(-1,""));
            return;
        }
        var consignor = req.body.consignor;
        var consignee = req.body.consignee;
        var consignorPhoneNumber = req.body.consignorPhoneNumber;
        var consigneePhoneNumber = req.body.consigneePhoneNumber;
        var consignorAddress = req.body.consignorAddress;
        var consigneeAddress = req.body.consigneeAddress;
        var weight = req.body.weight;
        var volume = req.body.volume;
        var count = req.body.count;
        var startAddressID = req.body.startAddressID;
        var endAddressID = req.body.endAddressID;
        var status = req.session.user.permission == 3?1:2;
        var confirmationPersonID = req.session.user.permission == 3?null:req.session.user.id;

        pool.getConnection(function (err,connection) {
            //查询定价
            connection.query('select * from price where id = 1',function (err,priceResult) {
                if(err){
                    data = new msg(-1,err);
                    res.json(data);
                    connection.release();
                }else {
                    var minPrice = priceResult[0].minPrice;
                    var weightPrice = priceResult[0].weightPrice;
                    var volumePrice = priceResult[0].cubePrice;
                    //查询站点
                    connection.query('select * from chinaCity where id = ? or id = ?',[startAddressID,endAddressID],function (err,addressResult) {
                        var data;
                        if(err){
                            data = new msg(-1,err);
                            res.json(data);
                            connection.release();
                        }else {
                            console.log(addressResult);
                            var longitudoDi = Math.pow((addressResult[0].longitudo-addressResult[1].longitudo)*85.39/100,2);
                            var latitudeDi = Math.pow((addressResult[0].latitude-addressResult[1].latitude)*111/100,2);
                            var distances = Math.sqrt(longitudoDi+latitudeDi);

                            //取价格的最大值
                            var totalPrice = weight*weightPrice*distances>minPrice?weight*weightPrice*distances:minPrice;
                            totalPrice = totalPrice>volume*volumePrice*distances?totalPrice:volume*volumePrice*distances;
                            totalPrice = totalPrice.toFixed(2);

                            //新建事务,同时向物流表及订单表中添加数据
                            connection.beginTransaction(function(err) {
                                if (err) { throw err; }
                                connection.query('INSERT INTO orders (userId, price, consignor,consignee,consignorAddress,consigneeAddress,weight,volume,consignorPhoneNumber,consigneePhoneNumber,startAddressID,endAddressID,count,status,confirmationPersonID) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);',
                                    [parseInt(req.session.user.id),parseFloat(totalPrice),consignor,consignee,consignorAddress,consigneeAddress,weight,volume,consignorPhoneNumber,consigneePhoneNumber,startAddressID,endAddressID,count,status,confirmationPersonID]
                                    ,function (err,result) {
                                    if (err) {
                                        return connection.rollback(function() {
                                            data = new msg(-1,err);
                                            res.json(data);
                                            connection.release();
                                        });
                                    }
                                        //查询刚刚插入的数据id
                                        var orderID;
                                        connection.query('select last_insert_id()',function (err,IDresult) {
                                            if(err){
                                                return connection.rollback(function() {
                                                    data = new msg(-1,err);
                                                    res.json(data);
                                                    connection.release();
                                                });
                                            }
                                            orderID = IDresult[0]['last_insert_id()'];
                                            var description = status==2?"订单揽件成功,准备发往目的地":"下单成功,等待揽收";
                                            connection.query('INSERT INTO logistics (description,operator,status,orderID) VALUES(?,?,?,?)',[description,req.session.user.id,status,orderID],function (err,logisticResult) {
                                                if (err) {
                                                    return connection.rollback(function() {
                                                        data = new msg(-1,err);
                                                        res.json(data);
                                                        connection.release();
                                                    });
                                                }
                                                connection.commit(function(err) {
                                                    if (err) {
                                                        return connection.rollback(function() {
                                                            data = new msg(-1,err);
                                                            res.json(data);
                                                            connection.release();
                                                        });
                                                    }
                                                    console.log('成功');
                                                    data = new msg(0,"成功",[]);
                                                    res.json(data);
                                                    connection.release();
                                                });
                                        })

                                    });
                                });
                            });
                            // connection.query('INSERT INTO orders (userId, price, consignor,consignee,consignorAddress,consigneeAddress,weight,volume,consignorPhoneNumber,consigneePhoneNumber,startAddressID,endAddressID,count,status,confirmationPersonID) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);',
                            //     [parseInt(req.session.user.id),parseFloat(totalPrice),consignor,consignee,consignorAddress,consigneeAddress,weight,volume,consignorPhoneNumber,consigneePhoneNumber,startAddressID,endAddressID,count,status,confirmationPersonID]
                            //     ,function (err,result) {
                            //     if(err){
                            //         data = new msg(-1,err);
                            //         res.json(data);
                            //         connection.release();
                            //     }else {
                            //         var description = "订单揽件成功,准备发往目的地";
                            //         var status = 2;
                            //         connection.query('INSERT INTO logistics (description,operator,status) VALUES (?,?,?);',[description,req.session.user.id,status],function (err,logisticResult) {
                            //             if(err){
                            //                 data = new msg(-1,err);
                            //                 res.json(data);
                            //                 connection.release();
                            //             }else {
                            //                 console.log('成功');
                            //                 data = new msg(0,"成功",[]);
                            //                 res.json(data);
                            //                 connection.release();
                            //             }
                            //         });
                            //     }
                            // });
                        }
                    });
                }
            });
        });
    },//查询订单表
    queryOrder:function (req,res,next) {
        pool.getConnection(function(err, connection) {
            if(err){
                throw err;
            }

            var order_status = req.body.order_status;
            var start = parseInt(req.body.start);
            var length = parseInt(req.body.length);
            var start_date = parseInt(req.body.start_date);
            var end_date = parseInt(req.body.end_date);
            var search_key = req.body.search_key || '';
            if(!start_date){
                start_date = 0;
            }
            if(!end_date){
                end_date = new Date().getTime()/1000;
            }
            //if(search_key){
            var search_sql = ' and (orders.id like "%'+search_key+'%" or orders.userId like "%'+search_key+'%") ';
            //}else{
            //    var search_sql = '';
            //}
            var order_status_sql = ' and orders.status like "%'+order_status+'%" ';

            connection.query('select orders.*,a.province as province1,a.city as city1 ,b.province as province2,b.city as city2 from orders left join chinaCity as a on orders.startAddressID = a.id left join chinaCity as b on orders.endAddressID = b.id where a.`status`>0 and orders.status>0'+search_sql+order_status_sql+' and orders.createTime BETWEEN FROM_UNIXTIME(?) and FROM_UNIXTIME(?) order by orders.createTime DESC limit ?,?', [start_date, end_date, start, length], function(err, result) {
                if(err){
                    res.json(new msg(-1, err));
                    connection.release();
                    return;
                }
                connection.query('select count(1) from `orders` where (status > 0) '+search_sql+order_status_sql+' and orders.createTime >= FROM_UNIXTIME(?) and orders.createTime <= FROM_UNIXTIME(?) ', [start_date, end_date], function(err, result2) {
                    res.json(new msg(0, '', {count: result2[0]['count(1)'], data: result}));
                });
                // 释放连接
                connection.release();
            });
        });
    },//查看订单详情
    queryOrderDetail:function (req,res,next) {
        pool.getConnection(function (err, connection) {
        if (err) {
            throw err;
        }
        var ID = req.body.ID;
        connection.query('select orders.*,a.province as province1,a.city as city1 ,b.province as province2,b.city as city2 from orders left join chinaCity as a on orders.startAddressID = a.id left join chinaCity as b on orders.endAddressID = b.id where orders.id = ?',ID,function (err,result) {
            var data;
            if(err){
                data = new msg(-1,err);
                res.json(data);
                connection.release();
            }else {
                //如果请求者非寄件人或工作管理人员则返回失败数据
                if(result.userID!=ID&&req.session.user.permission == 3){
                    data = new msg(-1,null);
                    res.json(data);
                    connection.release();
    
                }else {
                    data = new msg(0, '成功', {data: result});
                    res.json(data);
                    connection.release();
                }
            }
        });
    });
},//删除订单
    deleteOrder:function (req,res,next) {
        //判断用户的权限
        if(req.session.user.permission != 1){
            res.json(new msg(-1,""));
            return;
        }
        pool.getConnection(function(err, connection) {
            if(err){
                throw err;
            }
            var orderID = req.body.orderID;
            connection.query('update orders set status=0 where id = ?',[orderID], function(err, result) {
                if(err){
                    res.json(new msg(-1, err));
                    connection.release();
                    return;
                }
                res.json(new msg(0, ''));
                connection.release();
            });
        });
    },//查询物流信息
    queryLogistics:function (req,res,next) {
        pool.getConnection(function (err,connection) {
            if(err){
                throw  err;
            }
            var orderID = req.body.orderID;
            connection.query('select * from logistics where orderID = ?',[orderID],function (err,result) {
                if(err){
                    res.json(new msg(-1, err));
                    connection.release();
                    return;
                }
                var data = new msg(0, '成功', {data: result});
                res.json(data);
                connection.release();
            })
        })
    },//添加物流信息
    addLogistics:function (req,res,next) {
        if(req.session.user.permission != 1&&req.session.user.permission != 2){
            res.json(new msg(-1,""));
            return;
        }
        pool.getConnection(function (err,connection) {
            if (err) {
                throw  err;
            }
            var orderID = req.body.orderID;
            var description = req.body.description;
            var status = req.body.status;
            connection.query('INSERT INTO logistics (description,operator,status,orderID) VALUES(?,?,?,?)', [description, req.session.user.id, status, orderID], function (err, result) {
                if (err) {
                    res.json(new msg(-1, err));
                    connection.release();
                    return;
                }
                res.json(new msg(0, ''));
                connection.release();
            })
        })
    }
};

