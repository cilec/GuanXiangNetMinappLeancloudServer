'use strict';
const Router = require('koa-router');
const Order = require('../order');
const router = new Router();
const AV = require('leanengine');
const wxpay = require('../wxpay');
const { validateSign } = require('../utils');

const xml2js = require('xml2js');
const rawbody = require('rawbody');

const format = '___-_-_ _:_:__';
const formatTime = time =>
  new Date(
    time
      .split('')
      .map((value, index) => value + format[index])
      .join('')
      .replace(/_/g, ''),
  );

// 将XML转为JS对象
const parseXML = xml => {
  return new Promise((res, rej) => {
    xml2js.parseString(
      xml,
      { trim: true, explicitArray: false },
      (err, json) => {
        if (err) {
          rej(err);
        } else {
          res(json.xml);
        }
      },
    );
  });
};

// 处理微信支付回传notify
// 如果收到消息要跟微信回传是否接收到
const handleNotify = async ctx => {
  consol.log('ctx.req', ctx.req);
  const xml = await rawbody(ctx.req, {
    length: ctx.request.length,
    limit: '1mb',
    encoding: ctx.request.charset || 'utf-8',
  });

  const res = await parseXML(xml); // 解析xml
  const {
    result_code,
    err_code,
    err_code_des,
    out_trade_no,
    time_end,
    transaction_id,
    bank_type,
  } = res;
  console.log('res', res);
  // 如果都为SUCCESS代表支付成功
  // ... 这里是写入数据库的相关操作
  await new AV.Query(Order)
    .equalTo('tradeId', res.out_trade_no)
    .first({
      useMasterKey: true,
    })
    .then(order => {
      if (!order) throw new Error(`找不到订单${out_trade_no}`);
      if (order.status === 'SUCCESS') return;
      return order.save(
        {
          status: result_code,
          errorCode: err_code,
          errorCodeDes: err_code_des,
          paidAt: formatTime(time_end),
          transactionId: transaction_id,
          bankType: bank_type,
        },
        { useMasterKey: true },
      );
    })
    .then(() => {
      // 开始回传微信
      ctx.type = 'application/xml'; // 指定发送的请求类型是xml
      // 回传微信，告诉已经收到
      return (ctx.body = `<xml>
        <return_code><![CDATA[SUCCESS]]></return_code>
        <return_msg><![CDATA[OK]]></return_msg>
      </xml>
      `);
    })
    .catch(error => {
      // 如果支付失败，也回传微信
      ctx.status = 400;
      ctx.type = 'application/xml';
      ctx.body = `<xml>
    <return_code><![CDATA[FAIL]]></return_code>
    <return_msg><![CDATA[OK]]></return_msg>
  </xml>
  `;
    });
};
router.post('/weixin/pay-callback', handleNotify);
// router.post('/weixin/pay-callback', async function(ctx) {
//   const msg = ctx.request.body;
//   let req = ctx.req;
//   let res = ctx.res;
//   const {
//     result_code,
//     err_code,
//     err_code_des,
//     out_trade_no,
//     time_end,
//     transaction_id,
//     bank_type,
//   } = msg;

//   await new AV.Query(Order)
//     .equalTo('tradeId', out_trade_no)
//     .first({
//       useMasterKey: true, //开启超级权限，跳过class和acl检查
//     })
//     .then(order => {
//       if (!order) throw new Error(`找不到订单${out_trade_no}`);
//       if (order.status === 'SUCCESS') return;
//       console.table(msg, req, res);
//       return order.save(
//         {
//           status: result_code,
//           errorCode: err_code,
//           errorCodeDes: err_code_des,
//           paidAt: formatTime(time_end),
//           transactionId: transaction_id,
//           bankType: bank_type,
//         },
//         {
//           useMasterKey: true,
//         },
//       );
//     })
//     .then(() => {
//       res.success();
//     })
//     .catch(error => res.fail(error.message));
//   wxpay.useWXCallback((msg, req, res, next) => {
//     validateSign(msg);
//     console.log('msg', msg);
//   });
// });

module.exports = router;
