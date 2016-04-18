module.exports = {
  wx_config: {
    aotu: {
      token: 'tomWeiXinCourse',
      appid: 'wxddcbcf09ccc29da0',
      secret: '772fa99c88aa08c439c0b31af4a44b1c',
      cached: {},
      menu: {
        "button": [{
          "name": "关于我",
          "sub_button": [{
            "type": "view",
            "name": "博客",
            "url": "http://www.cnblogs.com/tom-zhu"
          }]
        }, {
          "name": "生活工具",
          "sub_button": [{
            "type": "click",
            "name": "天气",
            "key": "getlocationweather",
            "sub_button": []
          }]
        }, {
          "name": "开发小工具",
          "sub_button": [{
            "type": "click",
            "name": "扫一扫",
            "key": "scancode_push"
          }]
        }]
      }
    },
    tq: {
      "ipURL": "http://whois.pconline.com.cn/ipJson.jsp?json=true",
      "ipToCityNameURL": "http://apis.baidu.com/apistore/iplookupservice/iplookup?ip=",
      "ipToCityNameApiKey": "7328474baf90532437b4becdc5f65706",
      'cityUrl': 'http://apistore.baidu.com/microservice/cityinfo?cityname=',
      'weatherApikey': '7328474baf90532437b4becdc5f65706',
      'weatherUrl': 'http://apis.baidu.com/apistore/weatherservice/recentweathers?cityid='
    }
  }
};
