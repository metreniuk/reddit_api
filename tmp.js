const sleep = (ms) => new Promise((resolve, reject) => {
	setTimeout(() => {
		resolve({ hello: 'world' })
	}, ms)
})

const main = async () => {
  console.log('hello', await sleep(500)) 
}

main()
