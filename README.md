# yzhLogisticSystem

该项目还在不定期更新中，暂时先将管理员权限用户下的一些功能做完了

##使用说明

1.在终端该程序bin目录下使用 node www 指令运行程序。

2.如果出现依赖库未找到的错误，需要自己使用npm install 所需要的依赖库。

3.check.js为一个监听本程序运行状况并在程序出问题关闭时自动重启的小程序，在需要长期启动本系统时可以使用，也可以直接运行start.sh脚本。

4.该系统运行需要mysql的支持，sql的格式和基本数据存放在yzhDB.sql中需要导入进mysql

5.为方便进入，我在登录界面自动填充了管理员的账号密码，可以修改已下代码的value取消该功能

```
<input class="form-control" id="inputUsername" type="text" placeholder="用户名或手机号" required autofocus value="admin">
<input class="form-control" id="inputPassword" type="password" placeholder="密码" required value="123456">
```
