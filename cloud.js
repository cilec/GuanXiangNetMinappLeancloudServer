var AV = require("leanengine");

/**
 * 一个简单的云代码方法
 */
AV.Cloud.define("hello", function(request) {
  return "Hello world!";
});
AV.Cloud.define("getScanCode", function(request) {
  let options = {
    method: "POST",
    mode: "cors",
    cache: "default"
  };
  return fetch(
    `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${
      process.env.WEIXIN_APPID
    }&secret=${process.env.WEIXIN_APPSECRET}`,
    options
  )
    .then(res => {
      return res;
    })
    .catch(err => console.log(err));
});
