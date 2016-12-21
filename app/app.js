angular.module('myApp', [])
  .controller('MainController', ['$http', function ($http) {
    var that = this;
    that.channel = {};
    that.checkAll = function (bool) {
      for (var target in that.channel) {
        that.channel[target] = bool;
      }
    };

    that.getDateFromUnixTimeSeconds = function (unixTimeSeconds, format) {
      var fmt = {
        "MM": function (date) { return ('0' + (date.getMonth() + 1)).slice(-2); },
        "dd": function (date) { return ('0' + date.getDate()).slice(-2); },
        "hh": function (date) { return ('0' + date.getHours()).slice(-2); },
        "M": function (date) { return (' ' + (date.getMonth() + 1)).slice(-2); },
        "d": function (date) { return (' ' + date.getDate()).slice(-2); },
        "h": function (date) { return (' ' + date.getHours()).slice(-2); },
        "mm": function (date) { return ('0' + date.getMinutes()).slice(-2); }
      };
      var date = new Date(unixTimeSeconds * 1000);
      var result = format;
      for (var key in fmt)
        result = result.replace(key, fmt[key](date));
      return result;
    };

    that.doSearch = function () {

      $http({
        method: 'GET',
        url: 'http://localhost:63342/ng-abema-schedule/testdata/examples.json'
      }).success(function (data, status, headers, config) {
        console.log(status);
        // console.log(data);

        that.keys = Object.keys(data);
        that.keys.forEach(function (key) {
          if (['abema-news', 'space-shower', 'mahjong'].indexOf(key) >= 0) {
            that.channel[key] = true;
          } else {
            that.channel[key] = false;
          }
        });

        that.results = Object.values(data);

      }).error(function (data, status, headers, config) {
        console.log(status);
      });

    };

  }]);
