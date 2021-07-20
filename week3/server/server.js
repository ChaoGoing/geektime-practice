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
  background-color: rgb(0,255,255);
}
#container-row .box2{
  flex: 1;
  background-color: rgb(255,0,255);
}

#container-rowreverse{
  display: flex;
  flex-direction: row-reverse;
  justify-content: flex-start;
  width: 500px;
  background-color: rgb(255,255,0);
}
#container-rowreverse .box1{
  width: 100px;
  background-color: rgb(255, 255, 255);
}
#container-rowreverse .box2{
  width: 200px;
  background-color: rgb(0,255,255);
}
#container-rowreverse .box3{
  width: 400px;
  background-color: rgb(0,0,255);
}

#container-column{
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  width: 200px;
  background-color: rgb(255,255,255);
}
#container-column .box1{
  height: 100px;
  background-color: rgb(0,0,255);
}
#container-column .box2{
  height: 200px;
  background-color: rgb(255,0,255);
}

</style>
<body>
  <div class='first color'>123</div>
  <div id="container-row">
    <div class="box1"></div>
    <div class="box2"></div>
  </div> 
  <div id="container-rowreverse">
    <div class="box1"></div>
    <div class="box2"></div>
    <div class="box3"></div>
  </div>
  <div id="container-column">
    <div class="box1"></div>
    <div class="box2"></div>
  </div>
</body>
</html>`)
  })
}).listen(8088)