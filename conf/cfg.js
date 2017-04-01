/**
 * Created by taoyi-third on 2017/3/14.
 */
var os = require('os');
var path = require("path");

var cfg = {
    mysql:{
        host:'localhost',
        user:'root',
        password:'taoyi',
        database:'serveDatabase',
        port: 3306,
        acquireTimeout: 20000
    },
    footer_dir: 'footer_images/',
    comic_dir: 'comic/'
};


module.exports = cfg;

