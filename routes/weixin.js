'use strict';
const Router = require('koa-router');
const Order = require('../order');
const router = new Router();
const AV = require('leanengine');
const wxpay = require('../wxpay');
const { validateSign } = require('../utils');

const format = '___-_-_ _:_:__';
const formatTime = time =>
  new Date(
    time
      .split('')
      .map((value, index) => value + format[index])
      .join('')
      .replace(/_/g, ''),
  );

router.post('/pay-callback', async function(ctx) {
  const msg = ctx.request.body;
  let req = ctx.req;
  let res = ctx.res;
  wxpay.useWXCallback((msg, req, res, next) => {
    validateSign(msg);
    const {
      result_code,
      err_code,
      err_code_des,
      out_trade_no,
      time_end,
      transaction_id,
      bank_type,
    } = msg;
    new AV.Query(Order)
      .equalTo('tradeId', out_trade_no)
      .first({
        useMasterKey: true, //开启超级权限，跳过class和acl检查
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
          {
            useMasterKey: true,
          },
        );
      })
      .then(() => {
        res.success();
      })
      .catch(error => res.fail(error.message));
  });
});

module.exports = router;
