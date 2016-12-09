const fs = require('fs-extra');
const request = require('request');
const path = '../filesv1/';

let baseLink = 'https://www.reddit.com';
let catgsCount = process.argv[2] || 2;
let postsCount = process.argv[3] || 2;
let catgs = [];

function postsCustomRequest(catg, remained, after) {
  request(catg.url + '.json?after=' + after, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      let res = JSON.parse(body);
      let k = remained > 25 ? 25 : remained;
      for (let i = 0; i < k; i++) {
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
  request(baseLink + '/subreddits.json?after=' + after, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      let res = JSON.parse(body);
      let k = remained > 25 ? 25 : remained;
      for (let i = 0; i < k; i++) {
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
          for (let catg of catgs) {
            postsCustomRequest(catg, postsCount, '');
          }
        }
      }
    } else {
      console.log("Couldnt' connect\n" + error.message);
    }
  });
}

function clearFolder(path) {
  fs.emptyDir(path, err => {
    if (err) console.log(err.message);
    console.log(path + ' cleared');
  });
}

function writeInCatg(catg) {
  let html = `<html><head><title>${ catg.title }</title><body><ol>`;
  for (let post of catg.posts) {
    html += `<li><a href="${ post.url }">${ post.title }</a></li>`;
  }
  html += `</ol></body></html>`;
  fs.writeFile(path + catg.title + '.html', html, (err, data) => {
    if (err) console.log(err.message);else console.log('wrote in ' + catg.title);
  });
}

clearFolder(path);
catgsCustomRequest(catgsCount, '');