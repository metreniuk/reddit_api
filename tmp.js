const fs = require('fs-extra')
const request = require('request')
const rp = require('request-promise')

const safe = async (cb) => {
	try {
		await cb()
	} catch (e) {
		console.error(e)
	}
}

function sanitizeTitle(title) {
	if (title[0] == '/') {
		return title.split('/')[2]
	} else return title
	
}

function clearFolder(path) {
    fs.emptyDir(path, (err) => {
        if (err) console.log(err.message)
        console.log(path + ' cleared')
    })
    
}

const baseLink = 'https://www.reddit.com'
const subUrl = baseLink + '/subreddits.json'
const catgsCount = process.argv[2]
const postsCount = process.argv[3]
const path = "./files/"

// const req = (url) => new Promise((resolve, reject) => {
// 	request(url, (error, response, body) => {
// 		if (error) {
// 			return reject(error)
// 		}

// 		try {
// 			resolve(JSON.parse(body).data.children.length)
// 		} catch (e) {
// 			reject(e)
// 		}
// 	})	
// })



const getCatgs = async (url) => {
	let body = JSON.parse(await rp(url))
	let l = body.data.children.length
	let catgs = []
	for (let i = 0; i < catgsCount; i++) {
		catgs.push({
			title: sanitizeTitle(body.data.children[i].data.title),
			url: baseLink + body.data.children[i].data.url + '.json',
			posts: []
		})
	}
	return catgs	
}

const getPosts = async (url) => {
	let body = JSON.parse(await rp(url))
	let posts = []
	for (let i = 0; i < postsCount; i++) {
		posts.push({
			title: sanitizeTitle(body.data.children[i].data.title),
			url: baseLink + body.data.children[i].data.permalink,
		})
	}
	return posts
}

const generateHtml = (title, posts) => {
	let data = ""
    let html = `<html><head><title>${title}</title><body><ol>`

    for (let post of posts) {
        data += JSON.stringify(post)
        html +=`<li><a href="${post.url}">${post.title}</a></li>`
    }
    html += `</ol></body></html>`
    return html
}

const writeHtml = (path, html) => {
	fs.writeFile(path, html, (err, data) => {
        if(err) return err.message
            else console.log('wrote in ' + path)
    })
}

const main = async () => {
	let catgs = await getCatgs(subUrl)
	//console.log(catgs)
	
	clearFolder(path)
	for (let catg of catgs) {
		catg.posts = await getPosts(catg.url)
		//console.log(catg.posts)
		let html = generateHtml(catg.title, catg.posts)
		//console.log(html)
		writeHtml(path + catg.title + '.html', html)
	}
}

safe(main)

