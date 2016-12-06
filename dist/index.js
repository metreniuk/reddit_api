'use strict';

var fs = require('fs-extra');
var request = require('request');
var path = "../files/";

var baseLink = 'https://www.reddit.com';
var catgsCount = process.argv[2];
var postsCount = process.argv[3];
var catgs = [];
var posts = [];

clearFolder(path);
catgsCustomRequest(catgsCount, '');

function postsCustomRequest(catg, remained, after) {
    //console.log(catg.url + '.json?after=' + after)
    request(catg.url + '.json?after=' + after, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var res = JSON.parse(body);

            var k = remained > 25 ? 25 : remained;
            //console.log(remained)

            for (var i = 0; i < k; i++) {
                catg.posts.push({
                    title: res.data.children[i].data.title,
                    url: res.data.children[i].data.url,
                    after: res.data.after
                });
            }

            if (remained > 25) postsCustomRequest(catg, remained - 25, res.data.after);
            //console.log(remained)

            // if (catg.posts) {
            // 	console.log(catg)
            // }

            var data = "";
            var html = '<html><head><title>' + catg.title + '</title><body><ol>';

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = catg.posts[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var post = _step.value;

                    data += JSON.stringify(post);
                    html += '<li><a href="' + post.url + '">' + post.title + '</a></li>';
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

            html += '</ol></body></html>';

            fs.writeFile(path + catg.title + '.html', html, function (err, data) {
                if (err) console.log(err.message);
                //    else console.log(catg.title)
            });
        }
    });
}

function catgsCustomRequest(remained, after) {
    request(baseLink + '/subreddits.json?after=' + after, function (error, response, body) {

        if (!error && response.statusCode == 200) {

            var res = JSON.parse(body);

            var k = remained > 25 ? 25 : remained;
            //console.log(remained)

            for (var i = 0; i < k; i++) {
                catgs.push({
                    title: res.data.children[i].data.url.split('/')[2],
                    url: baseLink + res.data.children[i].data.url,
                    posts: [],
                    after: res.data.after
                });
            }

            if (remained > 25) catgsCustomRequest(remained - 25, res.data.after);

            if (catgs) {
                //console.log(catgs)

                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = catgs[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var catg = _step2.value;

                        postsCustomRequest(catg, postsCount, '');
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
            }
        } else {
            console.log("Couldnt' connect\n" + error.message);
        }
    });
}

function clearFolder(path) {
    fs.removeSync(path);

    fs.mkdirs(path, function (err) {
        if (err) return console.error(err);
        console.log(path + " created!");
    });
}