var fs = require('fs');
var net = require('net');
var mongoose = require('mongoose');

var conf = JSON.parse(fs.readFileSync('resources.json'));
mongoose.connect(conf.mongo.connect);

var Tweet = mongoose.model('Tweet', { tweet: String });
var Stats = mongoose.model('Stats', { numbers: String });
var Located = mongoose.model('Located', { data: String });

var Coords = mongoose.model('Coords', {
  coordinates: String,
  word: String
});

var categories = JSON.parse(fs.readFileSync('keywords.json'));

var stats = {};
Stats.find({}, function(error, stat) {
  if(stat[0] && stat[0].numbers != null) {
    stats = JSON.parse(stat[0].numbers);
    console.log('loaded stats');
  } else {
    for(var category in categories) {
      categories[category].forEach(function(word) {
        stats[word] = 0;
      });
    }
  }
});

var num = 0;

var processTweets = function() {

  var stream = Tweet.find().stream();
  stream.on('data', function(data) {
    num++;
    try {
      var tweet = JSON.parse(data.tweet);

      if(tweet.coordinates) {

        var keeper = new Located({ data: JSON.stringify(tweet) });
        keeper.save(function(error) {});

        var locatedWord = '';
        for(var word in stats) {
          if(tweet.text.indexOf(word) >= 0) {
            locatedWord = word;
          }
        }
        condensed = new Coords({
          coordinates: tweet.coordinates.coordinates.toString(),
          word: locatedWord
        });
        console.log(condensed);
        condensed.save(function(error) {});
      }

      for(var word in stats) {
        if(tweet.text.indexOf(word) >= 0) { stats[word]++; }
      }

    } catch(e) { console.log(e); }
  });

  stream.on('error', function(error) {
    console.log('DB READ ERROR');
    setTimeout(processTweet, 1000);
  });

  stream.on('close', function() {
    Tweet.remove({}, function() {});
    Stats.remove({}, function() {});
    var write = new Stats({ numbers: JSON.stringify(stats) });
    write.save(function(error) {});
    setTimeout(processTweets, 5000);
  });
}

var clean = function() {
  console.log('processed: '+num+'\t time: '+new Date());
  Located.find({}, function(error, tweets) {
    if(tweets.length > 300) {
      var gone = tweets.slice(280, tweets.length);
      gone.forEach(function(e) {
        Located.remove({ _id: e._id }, function() {});
      });
    }
  });
}

processTweets();

setInterval(clean, 30000);
