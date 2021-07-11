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
    response.end(`<html lang="en">
<head>
  <meta charset="UTF-8" />
</head>
<style>
div #target{
  color: #ffffff;
  height: 24px;
}
.first{
  height: 100px;
  width: 100px;
  background-color: #ccc;
}
.color {
  color: blue;
}
</style>
<body>
  <div class='first color'>123</div>
  <div id="target">target</div> 
</body>
</html>`)
  })
}).listen(8088)