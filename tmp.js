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
// })&count=${posts.length}

const getCatgsNicu = async (subRedditUrl, amount) => {
  const catgs = []
  let after = ''
  while (catgs.length < amount) {
    const response = await rp(`${subRedditUrl}?after=${after}&count=${catgs.length}`)
    after = response.after
    let p = []
    let ch = JSON.parse(response).data.children
    let l = amount - catgs.length < 26 ? amount - catgs.length : ch.length
    for (let i = 0; i < l; i++) {
      catgs.push({
        title: ch[i].data.url.split('/')[2],
        url: baseLink + ch[i].data.url + '.json',
        posts: []
      })
    }
  }
  return catgs
}

const getPostsNicu = async (catgUrl, amount) => {
  const posts = []
  let after = ''
  while (posts.length < amount) {
    const response = await rp(`${catgUrl}?after=${after}&count=${posts.length}`)
    after = response.after
    let p = []
    let ch = JSON.parse(response).data.children
    let l = amount - posts.length < 26 ? amount - posts.length : ch.length
    for (let i = 0; i < l; i++) {
      posts.push({
        title: sanitizeTitle(ch[i].data.title),
        url: baseLink + ch[i].data.permalink
      })
    }
  }
  return posts
}

const getCatgs = async (url, catgs, remained, after) => {
  let body = JSON.parse(await rp(url + '?after=' + after))
  let k = remained > maxPerPage ? maxPerPage : remained
  for (let i = 0; i < k; i++) {
    catgs.push({
      title: body.data.children[i].data.url.split('/')[2],
      url: baseLink + body.data.children[i].data.url + '.json',
      posts: []
    })
  }
  if (remained > maxPerPage) await getCatgs(url, catgs, remained - maxPerPage, body.data.after)
  return catgs
}

const getPosts = async (url, posts, remained, after) => {
  console.log(url + '?after=' + after)
  let body = JSON.parse(await rp(url + '?after=' + after))
  let k = remained > maxPerPage ? maxPerPage : remained
  for (let i = 0; i < k; i++) {
    posts.push({
      title: sanitizeTitle(body.data.children[i].data.title),
      url: baseLink + body.data.children[i].data.permalink
    })
  }
  if (remained > maxPerPage) await getPosts(url, posts, remained - maxPerPage, body.data.after)
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
  let catgs = []
  catgs = await getCatgs(subUrl, catgs, catgsCount)
  //console.log(catgs)
  clearFolder(path)
  for (let catg of catgs) {
    catg.posts = await getPosts(catg.url, catg.posts, postsCount)
    // console.log(catg.posts)
    let html = generateHtml(catg.title, catg.posts)
    // console.log(html)
    writeHtml(path + catg.title + '.html', html)
  }
  console.log('Categories: ' + catgs.length)
}

safe(main)