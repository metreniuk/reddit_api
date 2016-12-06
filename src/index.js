const fs = require('fs')
const request = require('request')
const path = "../files/"

let baseLink = 'https://www.reddit.com';
let catgsCount = process.argv[2]
let postsCount = process.argv[3]
let catgs = []
let posts = []

request(baseLink + '/subreddits.json', (error, response, body) => {

  if (!error && response.statusCode == 200) {
    let res = JSON.parse(body)
    if (catgsCount > 25) {

    }
    for (let i = 0; i < catgsCount; i++) {
    	catgs.push({
    		title: res.data.children[i].data.title,
    		url: baseLink + res.data.children[i].data.url,
    		posts: []
    	})
    }

    if (catgs) {
    	//console.log(catgs)
    	
    	for (let catg of catgs) {
    		request(catg.url + '.json', (error, response, body) => {
    			if (!error && response.statusCode == 200) {
    				let res = JSON.parse(body)

    				for (let i = 0; i < postsCount; i++) {
    					catg.posts.push({
    						title: res.data.children[i].data.title,
    						url: baseLink + res.data.children[i].data.permalink
    					})
    				}

    				if (catg.posts) {
    					console.log(catg)
    				}

    				let data = ""
    				let html = `<html><head><title>${catg.title}</title><body><ul>`

    				for (let post of catg.posts) {
    					data += JSON.stringify(post)
    					html +=`<li><a href="${post.url}">${post.title}</a></li>`
    				}

    				fs.writeFile(path + catg.title + '.html', html, (err, data) => {
    					if(err) console.log(err.message)
    				})
    			}
    		})
    	}
    }
  } else {
  	console.log("Couldnt' connect\n" + error.message)
  }
})

