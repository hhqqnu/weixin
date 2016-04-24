var sha1 = require('sha1'),
  events = require('events'),
  emitter = new events.EventEmitter(),
  xml2js = require('xml2js'),
  util = require('../util/util'),
  request = require('request');

var config = require('../config/config');
var aotuConfig = config.wx_config.aotu;

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

WeiXin.prototype.parseEventMsg = function() {
  var eventKey = '';
  if (this.data.EventKey) {
    eventKey = this.data.EventKey[0];
  }
  var msg = {
    "toUserName": this.data.ToUserName[0],
    "fromUserName": this.data.FromUserName[0],
    "createTime": this.data.CreateTime[0],
    "msgType": this.data.MsgType[0],
    "event": this.data.Event[0],
    "eventKey": eventKey
  }


  if (this.data.ScanCodeInfo) {
    msg.scanCodeInfo = this.data.ScanCodeInfo[0];
  }

  if (this.data.Latitude){
    msg.Latitude = this.data.Latitude[0];
  }

  if (this.data.Longitude){
    msg.Longitude = this.data.Longitude[0];
  }

  emitter.emit("weixinEventMsg", msg);
  return this;
}

WeiXin.prototype.parseImageMsg = function() {
  var msg = {
    "toUserName": this.data.ToUserName[0],
    "fromUserName": this.data.FromUserName[0],
    "createTime": this.data.CreateTime[0],
    "msgType": this.data.MsgType[0],
    "picUrl": this.data.PicUrl[0],
    "msgId": this.data.MsgId[0],
    "mediaId": this.data.MediaId[0]
  };
  emitter.emit('weixinImageMsg', msg);
  return this;
}

WeiXin.prototype.parseLocationMsg = function() {
  var msg = {
    "toUserName": this.data.ToUserName[0],
    "fromUserName": this.data.FromUserName[0],
    "createTime": this.data.CreateTime[0],
    "msgType": this.data.MsgType[0],
    "locationX": this.data.Location_X[0],
    "locationY": this.data.Location_Y[0],
    "scale": this.data.Scale[0],
    "label": this.data.Label[0],
    "msgId": this.data.MsgId[0]
  };
  emitter.emit('weixinLocationMsg', msg);
  return this;
}

WeiXin.prototype.eventMsg = function(callback) {
  emitter.on('weixinEventMsg', callback);
  return this;
}

WeiXin.prototype.imageMsg = function(callback) {
  emitter.on('weixinImageMsg', callback);
  return this;
}

WeiXin.prototype.locationMsg = function(callback) {
  emitter.on('weixinLocationMsg', callback);
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

WeiXin.prototype.sendPicMsg = function(msg) {
    var time = Math.round(new Date().getTime() / 1000);
    var output = "" +
      "<xml>" +
      "<ToUserName><![CDATA[" + msg.toUserName + "]]></ToUserName>" +
      "<FromUserName><![CDATA[" + msg.fromUserName + "]]></FromUserName>" +
      "<CreateTime>" + time + "</CreateTime>" +
      "<MsgType><![CDATA[" + msg.msgType + "]]></MsgType>" +
      "<Image>" +
      "<MediaId><![CDATA[" + msg.mediaId + "]]></MediaId>" +
      "</Image>" +
      "</xml>";
    this.res.type('xml');
    this.res.send(output);
    return this;
  }
  //TODO:
WeiXin.prototype.sendLocationMsg = function(msg) {
  return this;
}

WeiXin.prototype.parse = function() {
  this.msgType = this.data.MsgType[0] ? this.data.MsgType[0] : 'text';
  switch (this.msgType) {
    case 'text':
      this.parseTextMsg();
      break;
    case 'event':
      this.parseEventMsg();
      break;
    case 'image':
      this.parseImageMsg();
      break;
    case 'location':
      this.parseLocationMsg();
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
    case 'image':
      this.sendPicMsg(msg);
      break;
      /*case 'location':
        this.sendLocationMsg(msg);
        break;*/
  }
}

//获取用户信息
WeiXin.prototype.getUser = function(options, callback) {
  var self = this;
  util.getToken(aotuConfig, function(result) {
    if (result.err) {
      return callback({
        err: 1,
        msg: result.err
      });
    }
    var access_token = result.data.access_token;
    var url = 'https://api.weixin.qq.com/cgi-bin/user/info?access_token=' + access_token + '&openid=' + options.openId + '&lang=';
    if (options.lang) {
      url += options.lang;
    } else {
      url += 'zh_CN';
    }
    request.get({
      url: url
    }, function(error, httpResponse, body) {
      if (error) return callback({
        err: 1,
        msg: error
      });
      return callback({
        err: 0,
        msg: JSON.parse(body)
      });
    });
  });
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
