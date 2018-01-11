var AV = require("leanengine");
let Request = require("request");

/**
 * 一个简单的云代码方法
 */
AV.Cloud.define("hello", function(request) {
  return "Hello world!";
});
AV.Cloud.define("getScanCode", function(request) {
  Request(
    `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${
      process.env.WEIXIN_APPID
    }&secret=${process.env.WEIXIN_APPSECRET}`,
    (error, response, body) => {
      if (!error && response.statusCode == 200) {
        console.log(JSON.parse(body)); // 打印google首页
        Request.post(
          `https://api.weixin.qq.com/wxa/getwxacode?access_token=${
            JSON.parse(body).access_token
          }`,
          {
            form: JSON.stringify({  //这里是个巨坑，微信不支持表单提交，必须转成json字符串
              path: "pages/index/index",
              auto_color: true
            })
          },
          (error, response, body) => {
            console.log("二维码", body);
          }
        );
      }
    }
  );
});
