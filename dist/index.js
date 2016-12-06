'use strict';

var fs = require('fs');
var request = require('request');
var path = "../files/";

var baseLink = 'https://www.reddit.com';
var catgsCount = process.argv[2];
var postsCount = process.argv[3];
var catgs = [];
var posts = [];

request(baseLink + '/subreddits.json', function (error, response, body) {

  if (!error && response.statusCode == 200) {
    var res = JSON.parse(body);
    if (catgsCount > 25) {}
    for (var i = 0; i < catgsCount; i++) {
      catgs.push({
        title: res.data.children[i].data.title,
        url: baseLink + res.data.children[i].data.url,
        posts: []
      });
    }

    if (catgs) {
      //console.log(catgs)

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        var _loop = function _loop() {
          var catg = _step.value;

          request(catg.url + '.json', function (error, response, body) {
            if (!error && response.statusCode == 200) {
              var _res = JSON.parse(body);

              for (var _i = 0; _i < postsCount; _i++) {
                catg.posts.push({
                  title: _res.data.children[_i].data.title,
                  url: baseLink + _res.data.children[_i].data.permalink
                });
              }

              if (catg.posts) {
                console.log(catg);
              }

              var data = "";
              var html = '<html><head><title>' + catg.title + '</title><body><ul>';

              var _iteratorNormalCompletion2 = true;
              var _didIteratorError2 = false;
              var _iteratorError2 = undefined;

              try {
                for (var _iterator2 = catg.posts[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                  var post = _step2.value;

                  data += JSON.stringify(post);
                  html += '<li><a href="' + post.url + '">' + post.title + '</a></li>';
                }
              } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion2 && _iterator2.return) {
                    _iterator2.return();
                  }
                } finally {
                  if (_didIteratorError2) {
                    throw _iteratorError2;
                  }
                }
              }

              fs.writeFile(path + catg.title + '.html', html, function (err, data) {
                if (err) console.log(err.message);
              });
            }
          });
        };

        for (var _iterator = catgs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          _loop();
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  } else {
    console.log("Couldnt' connect\n" + error.message);
  }
});