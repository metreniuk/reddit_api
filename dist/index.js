'use strict';

var fs = require('fs-extra');
var request = require('request');
var path = '../filesv1/';

var baseLink = 'https://www.reddit.com';
var catgsCount = process.argv[2] || 2;
var postsCount = process.argv[3] || 2;
var catgs = [];

function postsCustomRequest(catg, remained, after) {
  request(catg.url + '.json?after=' + after, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var res = JSON.parse(body);
      var k = remained > 25 ? 25 : remained;
      for (var i = 0; i < k; i++) {
        if (i >= res.data.children.length) {
          console.log(catg.title + ': ' + catg.posts.length + ' posts');
          writeInCatg(catg);
          return;
        }
        catg.posts.push({
          title: res.data.children[i].data.title,
          url: res.data.children[i].data.url,
          after: res.data.after
        });
      }
      if (remained > 25) postsCustomRequest(catg, remained - 25, res.data.after);else {
        writeInCatg(catg);
      }
    }
  });
}

function catgsCustomRequest(remained, after) {
  request(baseLink + '/subreddits.json?after=' + after, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var res = JSON.parse(body);
      var k = remained > 25 ? 25 : remained;
      for (var i = 0; i < k; i++) {
        if (k > res.data.children.length) {
          console.log('There is no such amount of categories');
          return;
        }
        catgs.push({
          title: res.data.children[i].data.url.split('/')[2],
          url: baseLink + res.data.children[i].data.url,
          posts: [],
          after: res.data.after
        });
      }
      if (remained > 25) catgsCustomRequest(remained - 25, res.data.after);else {
        if (catgs) {
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = catgs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var catg = _step.value;

              postsCustomRequest(catg, postsCount, '');
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
      }
    } else {
      console.log("Couldnt' connect\n" + error.message);
    }
  });
}

function clearFolder(path) {
  fs.emptyDir(path, function (err) {
    if (err) console.log(err.message);
    console.log(path + ' cleared');
  });
}

function writeInCatg(catg) {
  var html = '<html><head><title>' + catg.title + '</title><body><ol>';
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = catg.posts[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var post = _step2.value;

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

  html += '</ol></body></html>';
  fs.writeFile(path + catg.title + '.html', html, function (err, data) {
    if (err) console.log(err.message);else console.log('wrote in ' + catg.title);
  });
}

clearFolder(path);
catgsCustomRequest(catgsCount, '');