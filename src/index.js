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
    for (let i = 0; i < catgsCount; i++) {
    	catgs.push({
    		title: res.data.children[i].data.title,
    		url: baseLink + res.data.children[i].data.url,
    		posts: [],
    		after: res.data.after
    	})
    }

    if (catgs) {
    	//console.log(catgs)
    	
    	for (let catg of catgs) {
    		customRequest(catg, postsCount, '')
    	}
    }
  } else {
  	console.log("Couldnt' connect\n" + error.message)
  }
})

function customRequest (catg, remained, after) {
	console.log(catg.url + '.json?after=' + after)
	request(catg.url + '.json?after=' + after, (error, response, body) => {
    			if (!error && response.statusCode == 200) {
    				let res = JSON.parse(body)
    				
    				let k = remained > 25 ? 25: remained
    				console.log(remained)

    				for (let i = 0; i < k; i++) {
    					
    					catg.posts.push({
    						title: res.data.children[i].data.title,
    						url: baseLink + res.data.children[i].data.permalink,
    						after: res.data.after
    					})

    				}
    				if (remained > 25) customRequest(catg, remained - 25, res.data.after)

    				// if (catg.posts) {
    				// 	console.log(catg)
    				// }

    				let data = ""
    				let html = `<html><head><title>${catg.title}</title><body><ol>`

    				for (let post of catg.posts) {
    					data += JSON.stringify(post)
    					html +=`<li><a href="${post.url}">${post.title}</a></li>`
    				}
    				html += `</ol></body></html>`

    				fs.writeFile(path + catg.title + '.html', html, (err, data) => {
    					if(err) console.log(err.message)
    				})
    			}
    		})
}

