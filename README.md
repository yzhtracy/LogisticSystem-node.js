# yzhLogisticSystem

该项目还在不定期更新中，暂时先将管理员权限用户下的一些功能做完了

## 使用说明

1.在终端该程序bin目录下使用 node www 指令运行程序。
```
node www
```

2.如果出现依赖库未找到的错误，需要自己使用npm install 所需要的依赖库。

3.check.js为一个监听本程序运行状况并在程序出问题关闭时自动重启的小程序，在需要长期启动本系统时可以使用，也可以直接运行start.sh脚本。
```
node www
node check.js
```
或
```
./start.sh
```

4.该系统运行需要mysql的支持，sql的格式和基本数据存放在yzhDB.sql中需要导入进mysql。

5.为方便进入，我在登录界面自动填充了管理员的账号密码，可以修改以下代码的value取消该功能。

```
<input class="form-control" id="inputUsername" type="text" placeholder="用户名或手机号" required autofocus value="admin">
<input class="form-control" id="inputPassword" type="password" placeholder="密码" required value="123456">
```

### 用户管理

#### 可以添加或删除用户，不同用户会拥有不同的功能权限，新注册用户默认为用户权限，管理员权限可以查看及修改所有用户的记录

![Alt text](https://github.com/yzhtracy/yzhLogisticSystem/raw/master/public/images/usermanage.png)

### 数据统计

#### 已可视化的形式展现全部或选定站定的收发货情况及仓库的储存状态

![Alt text](https://github.com/yzhtracy/yzhLogisticSystem/raw/master/public/images/Statistics.png)

### 创建订单

#### 根据用户所填信息自动计算价格生成订单，会根据用户身份自动生成初始物流状态

![Alt text](https://github.com/yzhtracy/yzhLogisticSystem/raw/master/public/images/createOrder.png)

### 站点管理

#### 添加或删除自己的站定仓库并设置容积，会对目的地的选择及价格有影响

![Alt text](https://github.com/yzhtracy/yzhLogisticSystem/raw/master/public/images/storehouseManage.png)

### 物流动态

#### 订单详情页提供相应的物流信息查询及管理，物流动态会同步订单状态

![Alt text](https://github.com/yzhtracy/yzhLogisticSystem/raw/master/public/images/logisticsInfo.png)

### 订单管理

#### 根据用户身份显示相应的可见订单列表，有模糊搜索和时间筛选功能

![Alt text](https://github.com/yzhtracy/yzhLogisticSystem/raw/master/public/images/orderManager.png)
