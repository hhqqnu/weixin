var router = require('express').Router();
var weixin = require('../api/weixin');
var tianqi = require('../api/tianqi');
var blog = require('../api/blog');

var config = require('../config/config');
var aotuConfig = config.wx_config.aotu;
var keywords = require('../config/keywords');

router.get('/', function(req, res, next) {
  if (weixin.checkSignature(req)) {
    return res.status(200).send(req.query.echostr);
  }
  return res.render('index', {
    createTime: new Date()
  });
});

router.post('/', function(req, res) {
  weixin.loop(req, res);
});

weixin.token = aotuConfig.token;

weixin.textMsg(function(msg) {
  var msgContent = trim(msg.content);
  var flag = false;
  var resMsg = {
    fromUserName: msg.toUserName,
    toUserName: msg.fromUserName,
    msgType: 'text',
    content: 'TOM在不断的成长，欢迎您给出宝贵的意见，有任何疑问请回复 help 或 bz',
    funcFlag: 0
  };

  if (!!keywords.exactKey[msgContent]) {
    resMsg.content = keywords.exactKey[msgContent].content;
    flag = true;
  } else if (isKeyInStr(msgContent, 'w')) {
    var splits = msgContent.split(' ');
    if (splits.length == 2) {
      var city = splits[1];
      //tianqi(city, tqCallback());
      tianqi(city, function(data) {
        resMsg.content = data;
        weixin.sendMsg(resMsg);
      });
    } else {
      //tianqi('', tqCallback());
      tianqi('', function(data) {
        resMsg.content = data;
        weixin.sendMsg(resMsg);
      });
    }
  } else if (isKeyInStr(msgContent, 'a')) {
    var splits = msgContent.split(' ');
    var reqBlogs = [];
    if (splits.length == 2) {
      var index = parseInt(splits[1], 10);
      if (isNaN(index)) {
        reqBlogs.push(blog.getLastBlog());
      } else {
        reqBlogs.push(blog.getBlogByIndex(index));
      }
    } else {
      reqBlogs = blog.getAllBlog();
    }

    resMsg = {
      fromUserName: msg.toUserName,
      toUserName: msg.fromUserName,
      msgType: 'news',
      reqBlogs: reqBlogs,
      funcFlag: 0
    };

    flag = true;
  } else {
    flag = true;
  }
  // 去掉前后空格并且转换成大写
  function trim(str) {
    return ("" + str).replace(/^\s+/gi, '').replace(/\s+$/gi, '').toUpperCase();
  }

  function isKeyInStr(str, key) {
    str = trim(str);
    key = trim(key);
    if (str.indexOf(key) !== -1) {
      return true;
    }
    return false;
  }

  if (flag) {
    weixin.sendMsg(resMsg);
  }

});



weixin.eventMsg(function(msg) {
  var flag = false;
  var resMsg = {
    fromUserName: msg.toUserName,
    toUserName: msg.fromUserName,
    msgType: 'text',
    content: '',
    funcFlag: 0
  };
  var eventName = msg.event;
  if (eventName == 'subscribe') {
    resMsg.content = 'TOM在此欢迎您！有任何疑问请回复 help 或 bz';
    flag = true;
  } else if (eventName == 'unsubscribe') {
    resMsg.content = 'TOM很伤心，为啥要取消呢?';
    flag = true;
  } else if (msg.event == 'CLICK') {
    if (msg.eventKey == 'getlocationweather') {
      tianqi('', function(data) {
        resMsg.content = data;
        weixin.sendMsg(resMsg);
      });
    } else if (msg.eventKey == 'scancode_push') {

    }
  } else if(eventName == 'scancode_push'){
    
  }else {
    flag = true;
  }
  if (flag) {
    weixin.sendMsg(resMsg);
  }
});


module.exports = router;
