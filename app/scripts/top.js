angular.module('myApp.top', ['ngRoute', 'ui.bootstrap', 'ngStorage'])
  .config(['$localStorageProvider',
    function ($localStorageProvider) {
      $localStorageProvider.setKeyPrefix('Abema-');
    }])
  .controller('topCtrl',
      ['$routeParams', '$http', '$interval', '$localStorage',
        function ($routeParams, $http, $interval, $localStorage) {

    var that = this;

    var ymd = $routeParams.yyyymmdd ? $routeParams.yyyymmdd : '';
    if (!/^(\d){8}$/.test(ymd)) {
      that.target_date = new Date();
      that.target_hour = that.target_date.getHours();
    } else {
      var y = ymd.substr(0, 4),
          m = ymd.substr(4, 2),
          d = ymd.substr(6, 2);
      that.target_date = new Date(y, m - 1, d);
      that.target_hour = 0;
    }

    that.$storage = $localStorage.$default({
      favorites: ['abema-news']
    });

    that.Now = new Date();
    function uptoDate() {
      that.Now = new Date();
      var timeString = that.Now.toLocaleTimeString();
      that.TimeString = timeString.substr(0, timeString.length - 3);
    }
    var t = $interval(uptoDate, 1000 * 60);

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

    that.getDateStringFromUnixTimeSeconds = function (unixTimeSeconds, format) {
      return that.getDateString(new Date(unixTimeSeconds * 1000), format);
    };

    that.getDateString = function (date, format) {
      if (!date) return '';
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

    that.isNowOnAir = function (startAt, endAt) {
      var start = new Date(startAt * 1000);
      var end = new Date(endAt * 1000);
      var now = that.Now;
      return (now >= start && now <= end);
    };

    that.dispTime = function () {

      var time = new Date();
      var hour = time.getHours();

      var el = document.createElement('div');
      el.textContent = that.getDateString(time, 'h:mm');
      el.classList.add('disp-time');

      // el.style.top = getRandPer() + '%';
      var min = time.getMinutes();
      var top = 70 + (hour - that.target_hour) * 180 + min * 3;
      el.style.top = top + 'px';

      document.body.appendChild(el);
      el.addEventListener("animationend", function callback(event) {
        document.body.removeChild(el);
        el.removeEventListener("animationend", callback);
      }, false);

      var el2 = document.createElement('hr');
      el2.classList.add('disp-time-hr');
      el2.style.top = top - 10 + 'px';

      document.body.appendChild(el2);
      el2.addEventListener("animationend", function callback(event) {
        document.body.removeChild(el2);
        el2.removeEventListener("animationend", callback);
      }, false);

    };

    that.doSearch = function () {
      var yyyyMMdd = that.getDateString(that.target_date, 'yyyyMMdd');

      $http({
        method: 'GET',
        url: ngAbemaSchedule.getUrl(yyyyMMdd)
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

        uptoDate();

        that.target_date.setHours(that.target_hour, 0, 0, 0, 0);
        var hours = [];
        for (i = 0; i < 24; i++) {
          if (that.target_hour <= i) hours.push(i);
        }
        that.hours = hours;

        that.results.forEach(function (result) {
          for (var i = 0; i < result.length; i++) {
            var slot = result[i];
            var key = slot.channelId;

            var mm = that.getDateStringFromUnixTimeSeconds(slot.startAt, 'mm');
            var start = new Date(slot.startAt * 1000);
            var end = new Date(slot.endAt * 1000);
            var min = (end - start) / 1000 / 60;

            var disp = end.getTime() < that.target_date.getTime() ? false : true;
            if (that.target_hour == 0) disp = true;
            var first = false;

            // var d1 = new Date(start);
            var d2 = new Date(that.target_date);
            var d3 = new Date(end);
            that.next_date = new Date(that.target_date);

            // d1.setHours(0, 0, 0, 0, 0);
            d2.setHours(that.target_hour, 0, 0, 0, 0);
            d3.setHours(that.target_hour, 0, 0, 0, 0);
            that.next_date.setHours(0, 0, 0, 0, 0);
            that.next_date.setDate(that.next_date.getDate()+1);

            if (start.getTime() < d2.getTime()) {
              var work = (end.getTime() > that.next_date.getTime()) ? that.next_date : end;
              min = (work - d2) / 1000 / 60;
              mm = '00';
              first = disp;
            }
            if (d2.getTime() != d3.getTime()) {
              var work = (start.getTime() < d2.getTime()) ? d2 : start;
              min = (that.next_date - work) / 1000 / 60;
            }
            if (min < 0) min = 0;

            var next = that.next_date;
            if (i + 1 < result.length) {
              next = new Date(result[i + 1].startAt * 1000);
            }
            var after = (next - end) / 1000 / 60;
            if (after < 0) after = 0;

            var prev = d2;
            if (!first && i > 0) {
              prev = new Date(result[i - 1].endAt * 1000);
            }
            var before = (start - prev) / 1000 / 60;
            if (before < 0) before = 0;

            that.channel[key][i] = {
              min: min,
              height: min * 3 + 'px',
              marginBottom: after * 3 + 'px',
              marginTop: before * 3 + 'px',
              mm: mm,
              disp: disp,
              first: first
            };
          }
        });

        that.dispTime();

      }).error(function (data, status, headers, config) {
        console.log(status);
      });

    };

  }]);
