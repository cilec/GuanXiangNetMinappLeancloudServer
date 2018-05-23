const wxpay = require('./wxpay');
const validateSign = res => {
  const sign = wxpay.sign(res);
  if (sign !== results.sign) {
    const error = new Error('微信返回参数签名结果不正确');
    error.code = 'INVALID_RESULT_SIGN';
    throw error;
  }
  return res;
};

const handleError = res => {
  if (res.return_code === 'FAIL') {
    throw new Error(res.return_msg);
  }
  if (res.result_code !== 'SUCCESS') {
    const error = new Error(res.err_code_des);
    error.code = res.err_code;
    throw error;
  }
  return res;
};
module.exports = {
  validateSign,
  handleError,
};
