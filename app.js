var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var session = require('express-session'); //如果要使用session，需要单独包含这个模块
var ejs = require('ejs');
var os = require('os');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('.html', ejs.__express);
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: '12345',
  name: 'sid',   //这里的name值得是cookie的name，默认cookie的name是：connect.sid
  cookie: {maxAge: 30*24*3600*1000 },  //一个月
  resave: false,
  saveUninitialized: true
}));
app.use(express.static(path.join(__dirname, 'public')));


//登录拦截器
app.use(function (req, res, next) {
  var url = req.originalUrl;
  console.log(req.session.user);
  if ((url != "/login"&&url != "/register"&&url != "/resetPassword"&&url != "/") && !req.session.user) {
    return res.redirect("/login");
  }
  next();
});




app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
