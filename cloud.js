let { Buffer } = require('buffer'); //处理二维码用

var AV = require('leanengine');
let Request = require('request');

const uuid = require('uuid/v4');
const Order = require('./order');
const wxpay = require('./wxpay');
/**
 * 一个简单的云代码方法
 */
AV.Cloud.define('hello', function(request) {
  return 'Hello world!';
});
//获取小程序码
AV.Cloud.define('getScanCode', function(request) {
  let id = request.params.id;
  return new Promise(function(resolve) {
    Request(
      `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${
        process.env.WEIXIN_APPID
      }&secret=${process.env.WEIXIN_APPSECRET}`,
      (error, response, body) => {
        if (!error && response.statusCode == 200) {
          let access_token = JSON.parse(body).access_token;
          console.log(`access_token`, access_token);
          resolve(access_token);
        } else {
          throw error;
        }
      },
    );
  })
    .then(res => {
      return new Promise(resolve => {
        // console.log(res);
        Request.post(
          `https://api.weixin.qq.com/wxa/getwxacode?access_token=${res}`,
          {
            encoding: null, //这里要将编码格式设为空才会返回二进制流,不然默认会对返回数据用utf-8的编码方式进行转码
            form: JSON.stringify({
              //这里是个巨坑，微信不支持表单提交，必须转成json字符串
              path: 'pages/details/details?id=' + id,
              auto_color: true,
            }),
          },
          (error, response, body) => {
            if (!error && response.statusCode == 200) {
              // console.log("二维码", body);
              // let imgdata = new Buffer(body);
              let file = new AV.File('test.png', body);
              console.log(body);
              resolve(file.save());
            } else {
              throw error;
            }
          },
        );
      });
    })
    .then(res => {
      console.log(res);
      return res;
    })
    .catch(err => console.log(err));
});

//下单函数
AV.Cloud.define('order', (req, res) => {
  const user = req.currentUser; //获取当前用户
  // console.log(req.params,req.meta.remoteAddress);
  if (!user) {
    return res.error(new Error('用户未登录'));
  }
  const authData = user.get('authData'); //leancloud自动帮我们加的鉴别参数
  if (!authData || !authData.lc_weapp) {
    return response.error(new Error('当前用户不是小程序用户'));
  }
  const order = new Order();
  //填写必要的订单参数
  order.tradeId = uuid().replace(/-/g, '');
  order.status = 'INIT';
  order.user = user;
  order.productDescription = req.params.productDescription;
  order.amount = req.params.price;
  order.ip = req.meta.remoteAddress;
  //匹配下ip，看是否是本地测试
  if (!(order.ip && /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(order.ip))) {
    order.ip = '127.0.0.1';
  }
  order.tradeType = 'JSAPI'; //微信规定，没得改
  //做了个pointer把article给存进去
  let article = AV.Object.createWithoutData('article', req.params.articleId);
  order.article = article;
  const acl = new AV.ACL(); //设定订单表的访问权限，创建订单的用户可以读，所有用户不能写
  acl.setPublicReadAccess(false);
  acl.setPublicWriteAccess(false);
  acl.setReadAccess(user, true);
  acl.setWriteAccess(user, false);
  order.setACL(acl);

  order
    .place()
    .then(() => {
      console.log(
        `预订单创建成功：订单号 [${order.tradeId}] prepayId [${
          order.prepayId
        }]`,
      );
      const payload = {
        appId: process.env.WEIXIN_APPID,
        timeStamp: String(Math.floor(Date.now() / 1000)),
        package: `prepay_id=${order.prepayId}`,
        signType: 'MD5',
        nonceStr: String(Math.random()),
      };
      payload.paySign = wxpay.sign(payload);
      res.success(payload);
    })
    .then(error => {
      console.error(error);
      response.error(error);
    });
});
