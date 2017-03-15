var express = require('express');
var router = express.Router();

var cfg = require('../conf/cfg.js');
var userDao = require('../dao/userDao.js');
var multer  = require('multer');
var formidable = require('formidable');
var os = require('os');
var lib = require('../lib.js');
var _ = require('lodash');
var async = require('async');
var request = require('superagent');



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});



//登录的post请求
router.post("/login", function(req, res, next) {
  userDao.login(req, res, next);

});

router.route("/login").get(function(req,res){    // 到达此路径则渲染login文件，并传出title值供 login.html使用
  res.render("login",{title:'User Login'});
});

/* GET resetPassword page. */
router.route("/resetPassword").get(function(req,res){    // 到达此路径则渲染register文件，并传出title值供 register.html使用
  res.render("resetPassword",{title:'User resetPassword'});
});
/* POST resetPassword page. */
router.post("/resetPassword", function(req, res, next) {
  userDao.resetPassword(req, res, next);

});

/* GET register page. */
router.route("/register").get(function(req,res){    // 到达此路径则渲染register文件，并传出title值供 register.html使用
  res.render("register",{title:'User register'});
});
/* POST register page. */
router.post("/register", function(req, res, next) {
  userDao.register(req, res, next);

});

/* GET logout page. */
router.post("/logout",function(req,res){    // 到达 /logout 路径则登出， session中user,error对象置空，并重定向到根路径
  userDao.logout(req, res);
});

/* GET home page. */
router.get("/home",function(req,res){
  if(!req.session.user){                     //到达/home路径首先判断是否已经登录
    req.session.error = "请先登录"
    res.redirect("/login");                //未登录则重定向到 /login 路径
  }
  res.render("home",{title:'Home'});         //已登录则渲染home页面
});




module.exports = router;