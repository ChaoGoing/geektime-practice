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
.first{
  height: 100px;
  width: 100px;
  background-color: #ccc;
}
.color {
  color: blue;
}

#container-row{
  display: flex;
  justify-content: space-between;
  width: 500px;
  background-color: rgb(255,255,255);
}
#container-row .box1{
  width: 100px;
}
#container-row .box2{
  flex: 1;
}

</style>
<body>
  <div class='first color'>123</div>
  <div id="container-row">
    <div id="box1"></div>
    <div id="box2"></div>
  </div> 
  <div id="container-rowreverse">
    <div id="box1"></div>
    <div id="box2"></div>
  </div>
  <div id="container-column">
    <div id="box1"></div>
    <div id="box2"></div>
  </div>
</body>
</html>`)
  })
}).listen(8088)