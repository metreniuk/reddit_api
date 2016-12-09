function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const fs = require('fs-extra');
const rp = require('request-promise');

const baseLink = 'https://www.reddit.com';
const subRedditUrl = baseLink + '/subreddits.json';
const categoriesCount = process.argv[2];
const postsCount = process.argv[3];
const maxPerPage = 25;
const path = '../files/';

const safe = (() => {
  var _ref = _asyncToGenerator(function* (cb) {
    try {
      yield cb();
    } catch (e) {
      console.error(e);
    }
  });

  return function safe(_x) {
    return _ref.apply(this, arguments);
  };
})();

function sanitizeTitle(title) {
  if (title[0] === '/') {
    return title.split('/')[1];
  } else return title;
}

function clearFolder(path) {
  fs.emptyDir(path, err => {
    if (err) return console.log(err.message);
    console.log(path + ' cleared');
  });
}

const getCategories = (() => {
  var _ref2 = _asyncToGenerator(function* (subRedditUrl, amount) {
    const categories = [];
    let after = '';
    let remained, ceil;
    while (categories.length < amount) {
      console.log(`request ${ subRedditUrl }?after=${ after }&count=${ categories.length }`);
      const response = JSON.parse((yield rp(`${ subRedditUrl }?after=${ after }&count=${ categories.length }`)));
      console.log(`response ${ subRedditUrl }?after=${ after }&count=${ categories.length }`);
      after = response.data.after;
      let children = response.data.children;
      remained = amount - categories.length;
      // to extract the amount of categories that I need
      ceil = remained < maxPerPage ? remained : children.length;
      for (let i = 0; i < ceil; i++) {
        if (children[i].data.url.split('/')[2] !== 'promos') {
          categories.push({
            title: children[i].data.url.split('/')[2],
            url: baseLink + children[i].data.url + '.json'
          });
        }
      }
    }
    return categories;
  });

  return function getCategories(_x2, _x3) {
    return _ref2.apply(this, arguments);
  };
})();

const getPosts = (() => {
  var _ref3 = _asyncToGenerator(function* (categoryUrl, amount) {
    const posts = [];
    let after = '';
    let remained, ceil;
    while (posts.length < amount) {
      console.log(`request ${ categoryUrl }?after=${ after }&count=${ posts.length }`);
      const response = JSON.parse((yield rp(`${ categoryUrl }?after=${ after }&count=${ posts.length }`)));
      console.log(`response ${ categoryUrl }?after=${ after }&count=${ posts.length }`);
      after = response.data.after;
      let children = response.data.children;
      remained = amount - posts.length;
      // to extract the amount of posts that I need
      ceil = remained < maxPerPage ? remained : children.length;
      for (let i = 0; i < ceil; i++) {
        if (i === children.length) {
          console.log(`${ categoryUrl } ${ posts.length } posts`);
          return posts;
        }
        posts.push({
          title: sanitizeTitle(children[i].data.title),
          url: baseLink + children[i].data.permalink
        });
      }
      if (response.data.after === null) {
        console.log(`${ categoryUrl } ${ posts.length } posts`);
        return posts;
      }
    }
    return posts;
  });

  return function getPosts(_x4, _x5) {
    return _ref3.apply(this, arguments);
  };
})();

const generateHtml = el => {
  let html = `<html><head><title>${ el.title }</title><body><ol>`;

  for (let post of el.posts) {
    html += `<li><a href="${ post.url }">${ post.title }</a></li>`;
  }
  html += `</ol></body></html>`;
  return html;
};

const writeHtml = (path, html) => {
  fs.writeFile(path, html, err => {
    if (err) return err.message;else console.log('wrote in ' + path);
  });
};

const main = (() => {
  var _ref4 = _asyncToGenerator(function* () {
    let categories = yield getCategories(subRedditUrl, categoriesCount);
    clearFolder(path);
    let promises = categories.map(function (el) {
      return getPosts(el.url, postsCount);
    });
    let bigPromise = Promise.all(promises);
    let responses = yield bigPromise;
    let detailedCategories = categories.map(function (el, index) {
      return {
        title: el.title,
        url: el.url,
        posts: responses[index]
      };
    });
    detailedCategories.forEach(function (el, index) {
      console.log(el.title, index);
      writeHtml(path + el.title + '.html', generateHtml(el));
    });
  });

  return function main() {
    return _ref4.apply(this, arguments);
  };
})();

safe(main);