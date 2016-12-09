const fs = require('fs-extra')
const rp = require('request-promise')

const baseLink = 'https://www.reddit.com'
const subRedditUrl = baseLink + '/subreddits.json'
const categoriesCount = process.argv[2]
const postsCount = process.argv[3]
const maxPerPage = 25
const path = '../files/'

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

const getCategories = async (subRedditUrl, amount) => {
  const categories = []
  let after = ''
  let remained, ceil
  while (categories.length < amount) {
    console.log(`request ${subRedditUrl}?after=${after}&count=${categories.length}`)
    const response = JSON.parse(await rp(`${subRedditUrl}?after=${after}&count=${categories.length}`))
    console.log(`response ${subRedditUrl}?after=${after}&count=${categories.length}`)
    after = response.data.after
    let children = response.data.children
    remained = amount - categories.length
    // to extract the amount of categories that I need
    ceil = remained < maxPerPage ? remained : children.length
    for (let i = 0; i < ceil; i++) {
      if (children[i].data.url.split('/')[2] !== 'promos') {
        categories.push({
          title: children[i].data.url.split('/')[2],
          url: baseLink + children[i].data.url + '.json'
        })
      }
    }
  }
  return categories
}

const getPosts = async (categoryUrl, amount) => {
  const posts = []
  let after = ''
  let remained, ceil
  while (posts.length < amount) {
    console.log(`request ${categoryUrl}?after=${after}&count=${posts.length}`)
    const response = JSON.parse(await rp(`${categoryUrl}?after=${after}&count=${posts.length}`))
    console.log(`response ${categoryUrl}?after=${after}&count=${posts.length}`)
    after = response.data.after
    let children = response.data.children
    remained = amount - posts.length
    // to extract the amount of posts that I need
    ceil = remained < maxPerPage ? remained : children.length
    for (let i = 0; i < ceil; i++) {
      if (i === children.length) {
        console.log(`${categoryUrl} ${posts.length} posts`)
        return posts
      }
      posts.push({
        title: sanitizeTitle(children[i].data.title),
        url: baseLink + children[i].data.permalink
      })
    }
    if (response.data.after === null) {
      console.log(`${categoryUrl} ${posts.length} posts`)
      return posts
    }
  }
  return posts
}

const generateHtml = (el) => {
  let html = `<html><head><title>${el.title}</title><body><ol>`

  for (let post of el.posts) {
    html += `<li><a href="${post.url}">${post.title}</a></li>`
  }
  html += `</ol></body></html>`
  return html
}

const writeHtml = (path, html) => {
  fs.writeFile(path, html, (err) => {
    if (err) return err.message
    else console.log('wrote in ' + path)
  })
}

const main = async () => {
  let categories = await getCategories(subRedditUrl, categoriesCount)
  clearFolder(path)
  let promises = categories.map(el => getPosts(el.url, postsCount))
  let bigPromise = Promise.all(promises)
  let responses = await bigPromise
  let detailedCategories = categories.map((el, index) => ({
    title: el.title,
    url: el.url,
    posts: responses[index]
  }))
  detailedCategories.forEach((el, index) => {
    console.log(el.title, index)
    writeHtml(path + el.title + '.html', generateHtml(el))
  })
}

safe(main)

