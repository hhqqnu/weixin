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

WeiXin.prototype.parseEventMsg = function(){
  var eventKey = '';
  if(this.data.EventKey){
    eventKey = this.data.EventKey[0];
  }
  var msg = {
    "toUserName" : this.data.ToUserName[0],
    "fromUserName" : this.data.FromUserName[0],
    "createTime" : this.data.CreateTime[0],
    "msgType" : this.data.MsgType[0],
    "event" : this.data.Event[0],
    "eventKey" : eventKey
  }

  emitter.emit("weixinEventMsg", msg);
  return this;
}

WeiXin.prototype.eventMsg = function(callback){
  emitter.on('weixinEventMsg',callback);
  return this;
}


WeiXin.prototype.sendTextMsg = function(msg) {
  if (msg.content == '') {
    this.res.type('string');
    this.res.send('');
    return this;
  }

  var time = Math.round(new Date().getTime() / 1000);
  var funcFlag = msg.funcFlag ? msg.funcFlag : this.funcFlag;
  var output = "" +
    "<xml>" +
    "<ToUserName><![CDATA[" + msg.toUserName + "]]></ToUserName>" +
    "<FromUserName><![CDATA[" + msg.fromUserName + "]]></FromUserName>" +
    "<CreateTime>" + time + "</CreateTime>" +
    "<MsgType><![CDATA[" + msg.msgType + "]]></MsgType>" +
    "<Content><![CDATA[" + msg.content + "]]></Content>" +
    "<FuncFlag>" + funcFlag + "</FuncFlag>" +
    "</xml>";
  this.res.type('xml');
  this.res.send(output);

  return this;


}

WeiXin.prototype.sendNewsMsg = function(msg) {
  var time = Math.round(new Date().getTime() / 1000);

  var blogsStr = '';
  for (var i = 0; i < msg.reqBlogs.length; i++) {
    var curBlog = msg.reqBlogs[i];
    blogsStr += "<item>" +
      "<Title><![CDATA[" + curBlog.title + "]]></Title>" +
      "<Description><![CDATA[" + curBlog.description + "]]></Description>" +
      "<PicUrl><![CDATA[" + curBlog.picUrl + "]]></PicUrl>" +
      "<Url><![CDATA[" + curBlog.url + "]]></Url>" +
      "</item>";
  }
  var funcFlag = msg.funcFlag ? msg.funcFlag : this.funcFlag;
  var output = "" +
    "<xml>" +
    "<ToUserName><![CDATA[" + msg.toUserName + "]]></ToUserName>" +
    "<FromUserName><![CDATA[" + msg.fromUserName + "]]></FromUserName>" +
    "<CreateTime>" + time + "</CreateTime>" +
    "<MsgType><![CDATA[" + msg.msgType + "]]></MsgType>" +
    "<ArticleCount>" + msg.reqBlogs.length + "</ArticleCount>" +
    "<Articles>" + blogsStr + "</Articles>" +
    "<FuncFlag>" + funcFlag + "</FuncFlag>" +
    "</xml>";
  this.res.type('xml');
  this.res.send(output);
  return this;
}


WeiXin.prototype.parse = function() {
  this.msgType = this.data.MsgType[0] ? this.data.MsgType[0] : 'text';
  switch (this.msgType) {
    case 'text':
      this.parseTextMsg();
    case 'event':
      this.parseEventMsg();
      break;
  }
}


WeiXin.prototype.sendMsg = function(msg) {
  switch (msg.msgType) {
    case 'text':
      this.sendTextMsg(msg);
      break;

    case 'news':
      this.sendNewsMsg(msg);
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
    console.log(buf);
    
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
