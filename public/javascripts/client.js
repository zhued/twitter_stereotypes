(function () {

  var app = angular.module('hateUI', []);
  app.controller('graphics', ['$http', function($http) {
    var ui = this;
    ui.title = 'Categorical Statistics';
    ui.stats = {};
    ui.categories = [];

    var map = L.map('usa-map').setView([40.010098, -105.268359], 13);
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    var update = function() {
      $http.get('/stats').success(function(data) {
        if(data) {
          ui.stats = angular.fromJson(data);
          var max = 0;
          for(var num in ui.stats.totals) {
            ui.categories.push(num);
            if(ui.stats.totals[num] > max) { max = ui.stats.totals[num]; }
          }
          graph.maxValue = max+200;
        }
      });
    };

    update();

    function createCanvas(divName) {

      var div = document.getElementById(divName);
      var canvas = document.createElement('canvas');
      div.appendChild(canvas);
      if (typeof G_vmlCanvasManager != 'undefined') {
        canvas = G_vmlCanvasManager.initElement(canvas);
      }
      var ctx = canvas.getContext("2d");
      return ctx;
    }

    var ctx = createCanvas("graphDiv1");

    var graph = new BarGraph(ctx);
    graph.margin = 2;
    graph.colors = ["#49a0d8", "#d353a0", "#ffc527", "#df4c27"];
    graph.xAxisLabelArr = ui.categories;
    setInterval(function () {
      update();
      var nums = [];
      for(n in ui.stats.totals) { nums.push(ui.stats.totals[n]); }
      graph.update(nums);
    }, 7000);

    var live = createCanvas("graphDiv2");

    var g2 = new BarGraph(live);
    g2.maxValue = 50;
    g2.margin = 2;
    g2.colors = ["#49a0d8", "#d353a0", "#ffc527", "#df4c27"];
    g2.xAxisLabelArr = ui.categories;
    setInterval(function () {
      update();
      g2.update([Math.random()*50, Math.random()*50, Math.random()*50]);
    }, 1000);
  }]);

}());
