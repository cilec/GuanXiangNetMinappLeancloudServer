const WXPay = require('weixin-pay');
//从环境变量里读取小程序参数配置
if (!process.env.WEIXIN_APPID)
  throw new Error('environment variable WEIXIN_APPID missing');
if (!process.env.WEIXIN_MCHID)
  throw new Error('environment variable WEIXIN_MCHID missing');
if (!process.env.WEIXIN_PAY_SECRET)
  throw new Error('environment variable WEIXIN_PAY_SECRET missing');
if (!process.env.WEIXIN_NOTIFY_URL)
  throw new Error('environment variable WEIXIN_NOTIFY_URL missing');
const wxpay = WXPay({
  appid: process.env.WEIXIN_APPID, //在云引擎配置的appid
  mch_id: process.env.WEIXIN_MCHID, //商户号id
  partner_key: process.env.WEIXIN_PAY_SECRET, //微信商户平台API密钥
  //pfx: fs.readFileSync('./wxpay_cert.p12'), //微信商户平台证书,如果没有退款功能的话可以不设置
});
module.exports = wxpay;
