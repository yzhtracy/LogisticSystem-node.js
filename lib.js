/**
 * Created by taoyi-third on 2017/3/14.
 */
var fs = require('fs');
var path = require('path');
var mysql = require('mysql');
var cfg = require('./conf/cfg.js');


// 使用连接池，提升性能
var pool;
var getPool = module.exports.getPool = function(){
    if(!pool){
        pool = mysql.createPool(cfg.mysql);
    }
    return pool;
}