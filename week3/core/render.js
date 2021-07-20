const images = require('images')

module.exports.render = function render(viewport, element) {
  console.log(element.style)
  if(element.style) {
    const img = images(element.style.width, element.style.height || 200)
    if(element.style['backgroundColor']) {
      const color = element.style['backgroundColor'] || 'rgb(0,0,0)'
      color.match(/rgb\((\d+),(\d+),(\d+)\)/)
      console.log(Number(RegExp.$1), Number(RegExp.$2), Number(RegExp.$3))
      img.fill(Number(RegExp.$1), Number(RegExp.$2), Number(RegExp.$3))
      viewport.draw(img, element.style.left || 0, element.style.top || 0)
    }
  }

  if(element.children) {
    for(let child of element.children) {
      render(viewport, child)
    }
  }
}

module.exports.renderCanvas = function render() {
  console.log("dom", dom)
}