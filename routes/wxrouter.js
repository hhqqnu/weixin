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

    } else if (msg.eventKey == 'my_info') {
      //TODO:发送的信息
      weixin.getUser({
        openId: msg.fromUserName
      }, function(data) {
        if (data.err) {
          resMsg.content = '获取ERROR：' + data.msg;
        } else {
          resMsg.content = JSON.stringify(data.msg);
        }
        weixin.sendMsg(resMsg);
      });
    }
  } else if (eventName == 'scancode_waitmsg') {
    resMsg.content = '当前操作:' + msg.scanCodeInfo.ScanType[0] + ',扫描结果:' + msg.scanCodeInfo.ScanResult[0];
    flag = true;
    //console.log('扫描事件',msg.scanCodeInfo);
  }else if (eventName == 'LOCATION'){
    resMsg.content = '上传地理位置纬度：'+msg.Latitude+',经度：'+ msg.Longitude;
    flag = true;
  } else {
    flag = true;
  }
  if (flag) {
    weixin.sendMsg(resMsg);
  }
});

weixin.imageMsg(function(msg) {
  var resMsg = {
    fromUserName: msg.toUserName,
    toUserName: msg.fromUserName,
    msgType: 'image',
    mediaId: msg.mediaId,
    funcFlag: 0
  };
  weixin.sendPicMsg(resMsg);
});

weixin.locationMsg(function(msg) {
  /* { toUserName: 'gh_348a152366bd',
   fromUserName: 'o9jPPv6wx9Q3ZQumaCL2T5L64sBw',
   createTime: '1461072687',
   msgType: 'location',
   locationX: '31.283890',
   locationY: '121.495202',
   scale: '15',
   label: '上海市虹口区',
   msgId: '6275259408149074106' }*/
  var resMsg = {
    fromUserName: msg.toUserName,
    toUserName: msg.fromUserName,
    msgType: 'text',
    content: msg.label,
    funcFlag: 0
  };
  weixin.sendMsg(resMsg);
});

module.exports = router;
