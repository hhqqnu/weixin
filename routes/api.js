var router = require('express').Router();
var request = require('request');

var config = require('../config/config');
var aotuConfig = config.wx_config.aotu;

var util = require('../util/util');

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
      form: form
    }, function(error, response, body) {
      if (!error) {
        return res.status(200).send(JSON.parse(body));
      }
      return res.status(500).send('创建菜单失败');
    });
  });
});

module.exports = router;
