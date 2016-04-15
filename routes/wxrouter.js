var router = require('express').Router();
var weixin = require('../api/weixin');


var config = require('../config/config');
var aotuConfig = config.wx_config.aotu;
var keyword = require('../config/keywords');

router.get('/', function(req, res, next) {
  if (weixin.checkSignature(req)) {
    return res.status(200).send(req.query.echostr);
  }
  return res.render('index');
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


  if (!!keyword.exactKey[msgContent]) {
    resMsg.content = keyword.exactKey[msgContent].content;
    flag = true;
  }else{
    flag = true;
  }

  // 去掉前后空格并且转换成大写
  function trim(str) {
    return ("" + str).replace(/^\s+/gi, '').replace(/\s+$/gi, '').toUpperCase();
  }

  if (falg) {
    weixin.sendMsg(resMsg);
  }
});



module.exports = router;
