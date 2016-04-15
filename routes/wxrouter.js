var router = require('express').Router();
var weixin = require('../api/weixin');
var tianqi = require('../api/tianqi');

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
})

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
  } else if (isKeyInStr(msgContent, 'tq')) {
    var splits = msgContent.split(' ');
    if (splits.length == 2) {
      var city = splits[1];
      tianqi(city, tqCallback());
    } else {
      tianqi('',tqCallback());
    }
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

  function tqCallback() {
    return function(json) {
      if (json.err) {
        return weixin.sendMsg(resMsg)
      }
      var data = json.msg;
      if (data.errNum == 0) {
        var today = data.retData.today;
        var todayStr = " " + data.retData.city + "天气 " + today.type + "\n";
        todayStr += "  当前温度 " + today.curTemp + "\n";
        todayStr += "  最低温度 " + today.lowtemp + "\n";
        todayStr += "  最高温度 " + today.hightemp + "\n";
        todayStr += "  风力 " + today.fengli + "\n";

        var todayOtherStr = "";

        today.index.forEach(function(item, index) {
          todayOtherStr += "\n " + (++index) + "." + item.name + " " + item.index + " " + item.details;
        });
        resMsg.content = todayStr + todayOtherStr;
        return weixin.sendMsg(resMsg);
      } else {
        return weixin.sendMsg(resMsg)
      }
    }
  }

  if (flag) {
    weixin.sendMsg(resMsg);
  }

});



module.exports = router;
