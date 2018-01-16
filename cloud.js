let { Buffer } = require("buffer");

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
        // console.log(res);
        Request.post(
          `https://api.weixin.qq.com/wxa/getwxacode?access_token=${res}`,
          {
            encoding: null, //这里要将编码格式设为空才会返回二进制流,不然默认会对返回数据用utf-8的编码方式进行转码
            form: JSON.stringify({
              //这里是个巨坑，微信不支持表单提交，必须转成json字符串
              path: "pages/index/index",
              auto_color: true
            })
          },
          (error, response, body) => {
            if (!error && response.statusCode == 200) {
              // console.log("二维码", body);
              // let imgdata = new Buffer(body);
              let file = new AV.File("test.png", body);
              console.log(body);
              resolve(file.save());
            } else {
              throw error;
            }
          }
        );
      });
    })
    .then(res => {
      console.log(res);
      return res;
    })
    .catch(err => console.log(err));
});
