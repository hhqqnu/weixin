var sha1 = require('sha1'),
    events = require('events'),
    emitter = new events.EventEmitter(),
    xml2js = require('xml2js');

var WeiXin = function(){
  this.data = '';
  this.msgType = 'text';
  this.fromUserName = '';
  this.toUserName = '';
  this.funcFlag = 0;
}

WeiXin.prototype.checkSignature = function(req){
  this.signature = req.query.signature;
  this.timestamp = req.query.timestamp;
  this.nonce = req.query.nonce;
  this.echostr = req.query.echostr;

  var array = [this.token,this.timestamp,this.nonce];
  array.sort();

  var str = sha1(array.join(""));
  return (str == this.signature) 
}

module.exports = new WeiXin();
