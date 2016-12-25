var ngAbemaSchedule = (function() {
  return {
    getUrl: function(yyyyMMdd) {
      var url = 'http://localhost:63342/ng-abema-schedule/testdata/examples.json';
      // url = 'http://localhost:63342/ng-abema-schedule/testdata/' + yyyyMMdd + '.json';
      return url;
    }
  }
})();
