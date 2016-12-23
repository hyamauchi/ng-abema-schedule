angular.module('myApp', ["ui.bootstrap", 'ngTouch'])
  .controller('SlideController', ['$http', function ($http) {

    var that = this;

    that.channel = [];

    that.current_slide = 0;
    // that.current_channel = 'drama';
    that.target_date = new Date();

    that.switchChannel = function (key) {
      // that.current_channel = key;
      for (var i = 0; i < that.channel.length; i++) {
        if (that.channel[i] == key) {
          that.current_slide = i;
          return;
        }
      }
    };

    that.getDateStringFromUnixTimeSeconds = function (unixTimeSeconds, format) {
      return that.getDateString(new Date(unixTimeSeconds * 1000), format);
    };

    that.getDateString = function (date, format) {
      var fmt = {
        "yyyy": function(date) { return date.getFullYear() + ''; },
        "MM": function (date) { return ('0' + (date.getMonth() + 1)).slice(-2); },
        "dd": function (date) { return ('0' + date.getDate()).slice(-2); },
        "hh": function (date) { return ('0' + date.getHours()).slice(-2); },
        "M": function (date) { return (' ' + (date.getMonth() + 1)).slice(-2); },
        "d": function (date) { return (' ' + date.getDate()).slice(-2); },
        "h": function (date) { return (' ' + date.getHours()).slice(-2); },
        "mm": function (date) { return ('0' + date.getMinutes()).slice(-2); }
      };
      var result = format;
      for (var key in fmt)
        result = result.replace(key, fmt[key](date));
      return result;
    };

    that.dispStartAt = function (firstStartAt, curStartAt) {
      var fmt = firstStartAt == curStartAt ? 'M/d h:mm' : 'h:mm';
      return that.getDateStringFromUnixTimeSeconds(curStartAt, fmt);
    };

    that.isNowOnAir = function (startAt, endAt) {
      var start = new Date(startAt * 1000);
      var end = new Date(endAt * 1000);
      var now = new Date();
      return (now >= start && now <= end);
    };

    that.isPast = function (endAt) {
      var end = new Date(endAt * 1000);
      var now = new Date();
      return (now > end);
    };

    that.doSearch = function () {
      var yyyyMMdd = that.getDateString(that.target_date, 'yyyyMMdd');
      var url = 'http://localhost:63342/ng-abema-schedule/testdata/examples.json';

      $http({
        method: 'GET',
        url: url
      }).success(function (data, status, headers, config) {
        console.log(status);
        // console.log(data);

        that.keys = Object.keys(data);
        that.keys.forEach(function (key) {
            that.channel.push(key);
        });
        that.results = Object.values(data);

      }).error(function (data, status, headers, config) {
        console.log(status);
      });

    };

  }]);
