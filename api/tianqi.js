var request = require('request');
var config = require('../config/config');
var tqConfig = config.wx_config.tq;


module.exports = function(word,callback) {
  if (!word) {
    request.get(tqConfig.ipURL, function(error, response, body) {
      var ipResult = JSON.parse(body);
      var options = {
        url: tqConfig.ipToCityNameURL + ipResult.ip,
        headers: {
          'apikey': tqConfig.ipToCityNameApiKey
        }
      };
      request.get(options, function(error, response, body) {
        var cityNameResult = JSON.parse(body);
        getDataByCityName(cityNameResult.retData.city,callback);
      });
    });
  } else {
    getDataByCityName(word,callback);
  }
}

function getDataByCityName(word, callback) {
  word = encodeURIComponent(word);
  request.get(tqConfig.cityUrl + word, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var cityResult = JSON.parse(body);
      if (cityResult.errNum == 0) {
        var options = {
          url: tqConfig.weatherUrl + cityResult.retData.cityCode,
          headers: {
            'apikey': tqConfig.weatherApikey
          }
        };
        request.get(options, function(error, response, body) {
          if (!error && response.statusCode == 200) {
            callback({
              err: false,
              msg: JSON.parse(body)
            });
          }
        });
      } else {
        callback({
          err: true,
          msg: cityResult.retMsg
        });
      }
    }
  });
}
