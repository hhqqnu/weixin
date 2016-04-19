var request = require('request');
var config = require('../config/config');
var tqConfig = config.wx_config.tq;


module.exports = function(word, callback) {
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
        if (cityNameResult && cityNameResult.retData && cityNameResult.retData.city) {
          var city = cityNameResult.retData.city;
          getDataByCityName(city, function(json) {
            returnTqCallback(json, callback);
          });
        }else{
          callback('error');
        }
        //getDataByCityName(city, returnTqCallback(json,callback));

      });
    });
  } else {
    //getDataByCityName(word, callback);
    getDataByCityName(word, function(json){
      returnTqCallback(json,callback);
    });
  }
}

function returnTqCallback(json, _callback) {
  var content = '';
  if (json.err) {
    return _callback('');
  }

  var data = json.msg;
  if (data && !data.errNum) {
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

    //console.log(data.retData.forecast);
    var forecastStr = '\n未来四天天气情况：';
    data.retData.forecast.forEach(function(item, index) {
      var i = index++;
      forecastStr += '\n' + item.date + ' ' + item.week + ' ' + item.fengxiang + ' ' + item.fengli + ' ' + item.hightemp + ' ' + item.lowtemp + ' ' + item.type;
    });
    content = todayStr + todayOtherStr + forecastStr;
  }
  _callback(content);
}

function getDataByCityName(word, callback) {
  word = encodeURIComponent(word);
  request.get(tqConfig.cityUrl + word, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var cityResult = JSON.parse(body);
      if (cityResult && !cityResult.errNum) {
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
