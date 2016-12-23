angular.module('myApp', ['ui.bootstrap', 'ngStorage'])
  .controller('SimpleController', ['$http', '$localStorage', function ($http, $localStorage) {

    var that = this;
    that.$storage = $localStorage.$default({
      favorites: ['abema-news']
    });

    that.channel = {};
    that.dispChannel = {};
    that.checkAll = function (bool) {
      for (var target in that.dispChannel) {
        that.dispChannel[target] = bool;
      }
      that.saveFavorites();
    };
    that.saveFavorites = function () {
      var favorites = [];
      for (var target in that.dispChannel) {
        if (that.dispChannel[target]) {
          favorites.push(target);
        }
      }
      that.$storage.favorites = favorites;
    };

    that.target_date = new Date();

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
          that.channel[key] = [];
          if (that.$storage.favorites.indexOf(key) >= 0) {
            that.dispChannel[key] = true;
          } else {
            that.dispChannel[key] = false;
          }
        });


        that.results = Object.values(data);

        that.results.forEach(function (result) {
          for (var i = 0; i < result.length; i++) {
            var slot = result[i];
            var key = slot.channelId;

            var mm = that.getDateStringFromUnixTimeSeconds(slot.startAt, 'mm');
            var start = new Date(slot.startAt * 1000);
            var end = new Date(slot.endAt * 1000);
            var min = (end - start) / 1000 / 60;

            var d1 = new Date(start);
            var d2 = new Date(that.target_date);
            var d3 = new Date(end);
            var tomorrow = new Date(that.target_date);

            d1.setHours(0, 0, 0, 0, 0);
            d2.setHours(0, 0, 0, 0, 0);
            d3.setHours(0, 0, 0, 0, 0);
            tomorrow.setHours(0, 0, 0, 0, 0);
            tomorrow.setDate(tomorrow.getDate()+1);

            if (d1.getTime() != d2.getTime()) {
              min = (end - d2) / 1000 / 60;
              mm = '00';
            }
            if (d2.getTime() != d3.getTime()) {
              min = (tomorrow - start) / 1000 / 60;
            }

            var next = tomorrow;
            if (i + 1 < result.length) {
              next = new Date(result[i + 1].startAt * 1000);
            }
            var after = (next - end) / 1000 / 60;
            if (after < 0) after = 0;

            var prev = d2;
            if (i > 0) {
              prev = new Date(result[i - 1].endAt * 1000);
            }
            var before = (start - prev) / 1000 / 60;
            if (before < 0) before = 0;

            that.channel[key][i] = {
              min: min,
              height: min * 3 + 'px',
              marginBottom: after * 3 + 'px',
              marginTop: before * 3 + 'px',
              mm: mm
            };
          }
        });

      }).error(function (data, status, headers, config) {
        console.log(status);
      });

    };

  }]);
