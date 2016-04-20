var router = require('express').Router();
var request = require('request');

var config = require('../config/config');
var aotuConfig = config.wx_config.aotu;

var util = require('../util/util');

var jssdk = require('../api/jssdk');

router.get('/', function(req, res, next) {
  res.status(200).send('api page');
});


router.get('/token', function(req, res, next) {
  util.getToken(aotuConfig, function(result) {
    if (result.err) {
      return res.status(500).send(result.msg);
    }
    return res.status(200).send(result.data);
  });
});

router.get('/menu_list', function(req, res, next) {
  util.getToken(aotuConfig, function(result) {
    if (result.err) {
      return res.status(500).send(result.msg);
    }
    var access_token = result.data.access_token;
    var url = 'https://api.weixin.qq.com/cgi-bin/menu/get?access_token=' + access_token;

    request.get({
      url: url
    }, function(error, response, body) {
      if (!error) {
        return res.status(200).send(JSON.parse(body));
      }
      return res.status(500).send('获取menu_list出错');
    });

  });
});

router.get('/menu_create', function(req, res, next) {
  var key = req.query.key;
  var form = !!key ? aotuConfig[key] : aotuConfig['menu'];
  var url = !!key ? 'https://api.weixin.qq.com/cgi-bin/menu/addconditional?access_token=' : 'https://api.weixin.qq.com/cgi-bin/menu/create?access_token=';

  util.getToken(aotuConfig, function(result) {
    if (result.err) {
      return res.status(500).send(result.msg);
    }
    var access_token = result.data.access_token;
    request.post({
      url: url + access_token,
      form: JSON.stringify(form)
    }, function(error, response, body) {
      if (!error) {
        return res.status(200).send(JSON.parse(body));
      }
      return res.status(500).send('创建菜单失败');
    });
  });
});

//发送群发消息
router.post('/send_all_text',function(req,res,next){
  var content = req.body.msgContent;
  var url = 'https://api.weixin.qq.com/cgi-bin/message/mass/sendall?access_token=';

  util.getToken(aotuConfig, function(result){
    if(result.err){
      return res.status(500).send(result.msg);
    }

    var form=   {
       "filter":{
          "is_to_all":true
       },
       "text":{
          "content":content
       },
        "msgtype":"text"
    }; 
    var access_token = result.data.access_token;
    request.post({
      url: url + access_token,
      form: JSON.stringify(form)
    },function(error,httpResponse,body){
      if(!error){
        return res.status(200).send(JSON.parse(body));
      }
      return res.status(500).send('群发消息失败');
    });
  });
});
//查看群发消息状态
router.post('/request_send_all_status',function(req,res,next){
  var msgId = req.body.msgId;
  var url = 'https://api.weixin.qq.com/cgi-bin/message/mass/get?access_token=';
  util.getToken(aotuConfig, function(result){
    if(result.err){
      return res.status(500).send(result.msg);
    }
    var form = {
     "msg_id":msgId
    }

    var access_token = result.data.access_token;
    request.post({
      url: url + access_token,
      form: JSON.stringify(form)
    },function(error,httpResponse,body){
      if(!error){
        return res.status(200).send(JSON.parse(body));
      }

      return res.status(500).send('查看群发消息失败');
    })
  });
});


router.get('/jssdk', function(req, res, next) {
  var url = req.query.url || '';
  //console.log(url);
  if (!!url) {
    new jssdk(url, res, function(data) {
      res.status(200).send({
        url: data.url,
        noncestr: data.noncestr,
        timestamp: data.timestamp,
        signature: data.signature,
        appid: aotuConfig.appid
      });
    });
  } else {
    res.status(200).send('请传入url');
  }
});

module.exports = router;
