const http = require('http');

http.createServer((request, response) => {
  console.log("get req")
  let body = [];
  request.on('error', (err) => {
    console.log(err)
  }).on('data', (chunk) => {
    body.push(chunk)
  }).on('end', () => {
    body = Buffer.concat(body).toString()
    console.log("body:", body)
    response.writeHead(200, { 'Content-Type': 'text/html' })
    response.end('Hello world')
  })
}).listen(8088)