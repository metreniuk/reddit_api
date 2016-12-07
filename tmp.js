const fs = require('fs-extra')
const rp = require('request-promise')

const safe = async (cb) => {
  try {
    await cb()
  } catch (e) {
    console.error(e)
  }
}

function sanitizeTitle (title) {
  if (title[0] === '/') {
    return title.split('/')[1]
  } else return title
}

function clearFolder (path) {
  fs.emptyDir(path, (err) => {
    if (err) return console.log(err.message)
    console.log(path + ' cleared')
  })
}

const baseLink = 'https://www.reddit.com'
const subUrl = baseLink + '/subreddits.json'
const catgsCount = process.argv[2]
const postsCount = process.argv[3]
const maxPerPage = 25
const path = './files/'
let allCatgs = []
// const req = (url) => new Promise((resolve, reject) => {
//  request(url, (error, response, body) => {
//    if (error) {
//      return reject(error)
//    }

//    try {
//      resolve(JSON.parse(body).data.children.length)
//    } catch (e) {
//      reject(e)
//   }
//  })
// })

const getCatgs = async (url, remained, after) => {
  let body = JSON.parse(await rp(url + '?after=' + after))
  let afterCatg = body.data.after
  let catgs = []
  let k = remained > maxPerPage ? maxPerPage : remained
  console.log(k)
  for (let i = 0; i < k; i++) {
    catgs.push({
      title: body.data.children[i].data.url.split('/')[2],
      url: baseLink + body.data.children[i].data.url + '.json',
      posts: []
    })
  }
  if (remained > maxPerPage) await getCatgs(url, remained - maxPerPage, body.data.after)
  return catgs
}

const getPosts = async (url) => {
  let body = JSON.parse(await rp(url))
  let posts = []
  for (let i = 0; i < postsCount; i++) {
    posts.push({
      title: sanitizeTitle(body.data.children[i].data.title),
      url: baseLink + body.data.children[i].data.permalink
    })
  }
  return posts
}

const generateHtml = (title, posts) => {
  let html = `<html><head><title>${title}</title><body><ol>`

  for (let post of posts) {
    html += `<li><a href="${post.url}">${post.title}</a></li>`
  }
  html += `</ol></body></html>`
  return html
}

const writeHtml = (path, html) => {
  fs.writeFile(path, html, (err, data) => {
    if (err) return err.message
    else console.log('wrote in ' + path)
  })
}

const main = async () => {
  let catgs = await getCatgs(subUrl, catgsCount)
  //console.log(catgs)
  clearFolder(path)
  for (let catg of catgs) {
    catg.posts = await getPosts(catg.url)
    // console.log(catg.posts)
    let html = generateHtml(catg.title, catg.posts)
    // console.log(html)
    writeHtml(path + catg.title + '.html', html)
  }
  console.log('Categories: ' + catgs.length)
}

safe(main)

