const AV = require('leanengine');
const wxpay = require('./wxpay');

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
  place(){
      return new Promise((resolve,reject)=>{
        //   wxpay.createUnifidOrder({

        //   })
      })
  }
}
