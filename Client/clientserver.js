const http = require('http')
const fs = require('fs')
const path = require('path')

process.on('uncaughtException', err => console.error('uncaughtException', err))
process.on('unhandledRejection', err => console.error('unhandledRejection', err))

const publicFolder = process.argv.length > 2 ? process.argv[2] : '.'
const port = process.argv.length > 3 ? process.argv[3] : 8000

const mediaTypes = {
zip: 'application/zip',
jpg: 'image/jpeg',
html: 'text/html',
js: 'application/javascript',
	/* add more media types */
}

const server = http.createServer(function(request, response) {
								 console.log(request.method + ' ' + request.url)
								 
								 const filepath = path.join(publicFolder, request.url)
								 fs.readFile(filepath, function(err, data) {
											 if (err) {
											 response.statusCode = 404
											 return response.end('File not found or you made an invalid request.')
											 }
											 
											 let mediaType = 'text/html'
											 const ext = path.extname(filepath)
											 if (ext.length > 0 && mediaTypes.hasOwnProperty(ext.slice(1))) {
											 mediaType = mediaTypes[ext.slice(1)]
											 }
											 
											 response.setHeader('Content-Type', mediaType)
											 response.end(data)
											 })
								 })

server.on('clientError', function onClientError(err, socket) {
		  console.log('clientError', err)
		  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n')
		  })

server.listen(port, '127.0.0.1', function() {
			  console.log('👨‍🔧 Development server is online.')
			  })
