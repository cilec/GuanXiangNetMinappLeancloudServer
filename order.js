const AV = require('leanengine');
const wxpay = require('./wxpay');

const { validateSign, handleError } = require('./utils');

class Order extends AV.Object {
  get tradeId() {
    return this.get('tradeId');
  }
  set tradeId(value) {
    this.set('tradeId', value);
  }

  get amount() {
    return this.get('amount');
  }
  set amount(value) {
    this.set('amount', value);
  }

  get user() {
    return this.get('user');
  }
  set user(value) {
    this.set('user', value);
  }

  get productDescription() {
    return this.get('productDescription');
  }
  set productDescription(value) {
    this.set('productDescription', value);
  }

  get status() {
    return this.get('status');
  }
  set status(value) {
    this.set('status', value);
  }

  get ip() {
    return this.get('ip');
  }
  set ip(value) {
    this.set('ip', value);
  }

  get tradeType() {
    return this.get('tradeType');
  }
  set tradeType(value) {
    this.set('tradeType', value);
  }

  get prepayId() {
    return this.get('prepayId');
  }
  set prepayId(value) {
    this.set('prepayId', value);
  }
  //下单
  place() {
    return new Promise((resolve, reject) => {
      //https://github.com/tvrcgo/weixin-pay   wxpay使用说明
      //wxpay.js里已做初始化
      wxpay.createUnifidOrder(
        {
          openid: this.user.get('authData').lc_weapp.openid, //leancloud自动帮你读取openid
          body: this.productDescription, //商品描述，可以自定义
          out_trade_no: this.tradeId, //订单号，最大32个字符，官方推荐时间加随机数的组合
          total_fee: this.amount, //总价格,单位分，整数
          spbill_create_ip: this.ip, //支付用户端ip
          notify_url: process.env.WEIXIN_NOTIFY_URL, //通知地址的回调，在云引擎里配置
          trade_type: this.tradeType, //'JSAPI'这是小程序指定的
        },
        (err, res) => {
          console.log(err, res);
          if (err) return reject(err);
          return resolve(res);
        },
      );
    }) //整个内部没做错误处理，直接在云函数中做错误处理
      .then(handleError)
      .then(validateSign)
      .then(({ prepay_id }) => {
        this.prepayId = prepay_id;
        return this.save();
      });
  }
}
AV.Object.register(Order); //在sdk中注册这个class
module.exports = Order;
