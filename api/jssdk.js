'use strict';

var sha1 = require('sha1'),
  request = require('request');

var config = require('../config/config').wx_config.aotu;

var util = require('../util/util');

var JSSDK = function(url,res, callback) {
  var self = this;
  this.res = res;
  this.data = {};
  this.data.url = url;
  this.data.noncestr = this.createNonceStr();
  this.data.timestamp = this.createTimeStamp();
  this.getTicket(function(ticket) {
    self.data.ticket = ticket;
    self.data.signature = self.calcSignature(self.data.ticket, self.data.noncestr, self.data.timestamp, url);
    callback(self.data);
  });
}

JSSDK.prototype.getTicket = function(_callback) {
  var self = this;
  util.getToken(config, function(result) {
    if (result.err) {
      self.res.status(500).send(result.msg);
    } else {
      var access_token = result.data.access_token;
      var url = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + access_token + '&type=jsapi';

      if (config.cached.jsapi_ticket && config.cached.jsapi_ticket.timestamp) {
        var ts = config.cached.jsapi_ticket.timestamp;
        if (util.isExpireTimeOut(ts)) {
          request.get({
            url: url
          }, function(error, httpResponse, body) {
            config.cached.jsapi_ticket = JSON.parse(body);
            config.cached.jsapi_ticket.timestamp = util.createTimeStamp();
            _callback(config.cached.jsapi_ticket);
          });
        } else {
          _callback(config.cached.jsapi_ticket);
        }
      } else {
        request.get({
          url: url
        }, function(error, httpResponse, body) {
          config.cached.jsapi_ticket = JSON.parse(body);
          config.cached.jsapi_ticket.timestamp = util.createTimeStamp();
          _callback(config.cached.jsapi_ticket);
        });
      }
    }
  });
}



JSSDK.prototype.calcSignature = function(ticket, noncestr, timestamp, url) {
  var str = 'jsapi_ticket=' + ticket.ticket + '&noncestr=' + noncestr +
    '&timestamp=' + timestamp + '&url=' + url;
  return sha1(str);
}

JSSDK.prototype.createNonceStr = function() {
  return Math.random().toString(36).substr(2, 15);
}

JSSDK.prototype.createTimeStamp = function() {
  return parseInt(new Date().getTime() / 100, 10) + '';
}

module.exports = JSSDK;
