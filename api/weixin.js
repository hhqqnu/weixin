var sha1 = require('sha1'),
  events = require('events'),
  emitter = new events.EventEmitter(),
  xml2js = require('xml2js');

var WeiXin = function() {
  this.data = '';
  this.msgType = 'text';
  this.fromUserName = '';
  this.toUserName = '';
  this.funcFlag = 0;
}

WeiXin.prototype.checkSignature = function(req) {
  this.signature = req.query.signature;
  this.timestamp = req.query.timestamp;
  this.nonce = req.query.nonce;
  this.echostr = req.query.echostr;

  var array = [this.token, this.timestamp, this.nonce];
  array.sort();

  var str = sha1(array.join(""));
  return (str == this.signature)
}


WeiXin.prototype.textMsg = function(callback) {
  emitter.on('weixinTextMsg', callback);
  return this;
}

WeiXin.prototype.parseTextMsg = function() {
  var msg = {
    "toUserName": this.data.ToUserName[0],
    "fromUserName": this.data.FromUserName[0],
    "createTime": this.data.CreateTime[0],
    "msgType": this.data.MsgType[0],
    "content": this.data.Content[0],
    "msgId": this.data.MsgId[0],
  };

  emitter.emit('weixinTextMsg', msg);
  return this;
}



WeiXin.prototype.parse = function() {
  this.msgType = this.data.MsgType[0] ? this.data.MsgType[0] : 'text';
  switch (this.msgType) {
    case 'text':
      this.parseTextMsg();
      break;
  }
}


WeiXin.prototype.loop = function(req, res) {
  this.res = res;
  var self = this;

  var buf = '';
  req.setEncoding('utf-8');
  req.on('data', function(chunk) {
    buf += chunk;
  });

  req.on('end', function() {
    xml2js.parseString(buf, function(err, json) {
      if (err) {
        err.status = 400;
      } else {
        req.body = json;
      }
    });

    self.data = req.body.xml;
    self.parse();
  });
}


module.exports = new WeiXin();
