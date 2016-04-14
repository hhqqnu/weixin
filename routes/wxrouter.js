var router = require('express').Router();
var weixin = require('../api/weixin');


var config = require('../config/config');
var aotuConfig = config.wx_config.aotu;

router.get('/',function(req,res,next){
  if(weixin.checkSignature(req)){
    return res.status(200).send(req.query.echostr);
  }
  return res.render('index');
})

weixin.token = aotuConfig.token;

module.exports = router;
