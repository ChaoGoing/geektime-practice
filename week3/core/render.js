const images = require('images')

let offsetHeight = 0

module.exports.render = function render(viewport, element) {
  if(element.style) {
    const img = images(element.style.width, element.style.height || 200)
    if(element.style['backgroundColor']) {
      const color = element.style['backgroundColor'] || 'rgb(0,0,0)'
      color.match(/rgb\((\d+),(\d+),(\d+)\)/)
      img.fill(Number(RegExp.$1), Number(RegExp.$2), Number(RegExp.$3))
      const top = (element.style.top || 0) + offsetHeight
      console.log("top", top)
      viewport.draw(img, element.style.left || 0, top)
    }
  }

  if(element.children) {
    for(let child of element.children) {
      render(viewport, child)
    }
  }
  if(element.style && element.style.display === 'flex') {
    offsetHeight += element.style.height || 200
    console.log("offsetHeight", offsetHeight)
  }
}

module.exports.renderCanvas = function render() {
  console.log("dom", dom)
  // todo
}