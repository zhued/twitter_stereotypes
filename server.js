var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var fs = require('fs');

Array.prototype.contains = function(q) {
  var ans = false;
  this.forEach(function(e) { if(e == q) { ans = true; return; }});
  return ans;
}

var conf = JSON.parse(fs.readFileSync('resources.json'));
mongoose.connect(conf.mongo.connect);

var categories = JSON.parse(fs.readFileSync('keywords.json'));
var totals = {}; var percentages = {};
for(var category in categories) { totals[category] = 0; percentages[category] = 0 };

var Tweet = mongoose.model('Tweet', { tweet: String });
var Stats = mongoose.model('Stats', { numbers: String });
var Located = mongoose.model('Located', { data: String });
var Coords = mongoose.model('Coords', { coordinates: String, word: String });

var app = express();

var http = require('http').Server(app);

app.get('/', function(req, res) {
  res.render('index');
});

app.get('/stats', function(req, res) {
  var totals = {}; var percentages = {};
  for(var category in categories) { totals[category] = 0; percentages[category] = 0 };
  Stats.find({}, function(error, stats) {
    if(error) { res.send(error); }
    else {
      try {
        var nums = JSON.parse(stats[0].numbers);
        var keys = Object.keys(nums);
        var all = 0;
        keys.forEach(function(key) {
          for(var category in categories) {
            if(categories[category].contains(key)){
              totals[category] += nums[key];
              all += nums[key]
            }
          }
        });
        Object.keys(totals).forEach(function(category) {
          percentages[category] = totals[category]/all;
        });
        res.send(JSON.stringify({totals: totals, percentages: percentages}));
      } catch(e) { res.send(e); }
    }
  });
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


http.listen(8080, function() { console.log('listening on 8080'); });
