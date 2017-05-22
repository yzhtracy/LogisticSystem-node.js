var express = require('express');
var router = express.Router();

var cfg = require('../conf/cfg.js');
var userDao = require('../dao/userDao.js');
var priceDao = require('../dao/priceDao.js');
var orderDao = require('../dao/orderDao');


var multer  = require('multer');
var formidable = require('formidable');
var os = require('os');
var lib = require('../lib.js');
var _ = require('lodash');
var async = require('async');
var request = require('superagent');



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index',{ user: req.session.user });
});


// ===============================注册登录相关请求========================================
//登录的post请求
router.post("/login", function(req, res, next) {
  userDao.login(req, res, next);

});

router.route("/login").get(function(req,res){    // 到达此路径则渲染login文件，并传出title值供 login.html使用
  res.render("login",{ user: req.session.user });
});

/* GET resetPassword page. */
router.route("/resetPassword").get(function(req,res){    // 到达此路径则渲染register文件，并传出title值供 register.html使用
  res.render("resetPassword",{ user: req.session.user });
});
/* POST resetPassword page. */
router.post("/resetPassword", function(req, res, next) {
  userDao.resetPassword(req, res, next);

});

/* GET register page. */
router.route("/register").get(function(req,res){    // 到达此路径则渲染register文件，并传出title值供 register.html使用
  res.render("register",{ user: req.session.user });
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
  res.render("home",{ user: req.session.user });         //已登录则渲染home页面

});

//============================管理员相关=================================

//用户管理管理
router.get('/userlist', function(req, res, next) {
  res.render('userlist', { user: req.session.user});
});
router.get('/user/add', function(req, res, next) {
  res.render('userform', { user: req.session.user});
});
router.get('/user/edit', function(req, res, next) {
  res.render('userform', {user: req.session.user});
});

//站点及价格管理
router.get('/priceManage', function(req, res, next) {
  res.render('priceManage', { user: req.session.user});
});


//============================订单相关=================================
//新增订单
router.get('/createOrder',function (req,res,next) {
  res.render('createOrder',{ user: req.session.user});
})
//查询订单表
router.get('/orderlist',function (req,res,next) {
  res.render('orderlist',{user:req.session.user});
})

router.get('/orderDetail',function (req,res,next) {
  res.render('orderDetail',{user:req.session.user});
})

//API接口
//============================用户管理API=============================
router.post('/user/query', function(req, res, next) {
  userDao.query(req, res, next,req.session.user);
});
router.post('/addUser',function (req,res,next) {
  userDao.addUser(req, res, next,req.session.user);
});
router.post('/editUser',function (req,res,next) {
  userDao.editUser(req, res, next,req.session.user);
});
router.post('/deleteUser',function (req,res,next) {
  userDao.deleteUser(req, res, next,req.session.user);
});

//站点及价格管理
router.get('/queryPrice',function (req,res,next) {
  priceDao.queryPrice(req,res,next);
})
router.post('/changePrice',function (req,res,next) {
  priceDao.changePrice(req,res,next);
})
router.get('/getLogisticAddress',function (req,res,next) {
  priceDao.getLogisticAddress(req,res,next);
})
router.post('/addAddress',function (req,res,next) {
  priceDao.addAddress(req,res,next);
  
})
router.post('/address/query',function (req,res,next) {
  priceDao.queryAddress(req,res,next);
})
router.post('/changeAddress',function (req,res,next) {
  priceDao.changeAddress(req,res,next);
})
router.post('/deleteAddress',function (req,res,next) {
  priceDao.deleteAddress(req,res,next);
})

//===============================订单API=========================
router.post('/order/queryAddress',function (req,res,next) {
  orderDao.queryAddress(req,res,next);
})
router.post('/order/createOrder',function (req,res,next) {
  orderDao.createOrder(req,res,next);
})

router.post('/order/query',function (req,res,next) {
  orderDao.queryOrder(req,res,next);
})

router.post('/order/detailQuery',function (req,res,next) {
  orderDao.queryOrderDetail(req,res,next );
})
router.post('/deleteOrder',function (req,res,next) {
  orderDao.deleteOrder(req,res,next);
})
router.post('/order/queryLogistics',function (req,res,next) {
  orderDao.queryLogistics(req,res,next);
})
router.post('/order/addLogistics',function (req,res,next) {
  orderDao.addLogistics(req,res,next);
})

module.exports = router;