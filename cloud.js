var AV = require("leanengine");
let Request = require("request");
let fs = require("fs");
/**
 * 一个简单的云代码方法
 */
AV.Cloud.define("hello", function(request) {
  return "Hello world!";
});
AV.Cloud.define("getScanCode", function(request) {
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
      }
    );
  })
    .then(res => {
      return new Promise(resolve => {
        console.log(res);
        Request.post(
          `https://api.weixin.qq.com/wxa/getwxacode?access_token=${res}`,
          {
            form: JSON.stringify({
              //这里是个巨坑，微信不支持表单提交，必须转成json字符串
              path: "pages/index/index",
              auto_color: true
            })
          },
          (error, response, body) => {
            if (!error && response.statusCode == 200) {
              console.log("二维码");
              base64Img = body.toString("base64");
              console.log("base64Img", base64Img);
              resolve(body);
            } else {
              throw error;
            }
          }
        );
      });
    })
    .then(res => {
      console.log(res);
      let base64Img = res.toString("base64");
      console.log("base64Img", base64Img);
      return base64Img;
    })
    .catch(err => console.log(err));
});
