function getStyle(ele) {
  if(!ele.style) {
    ele.style = {}
  }
  for(let prop in ele.computedStyle) {
    const p = ele.computedStyle[prop].value
    ele.style[prop] = p
    if(p.toString().match(/px$/) || p.toString().match(/^[0-9\.]+$/)) {
      ele.style[prop] = parseInt(p)
    }
  }
  return ele.style
}


function layout(element) {
  if(!element.computedStyle) {
    return
  }

  const elementStyle = getStyle(element);
  if(element.display !== 'flex') {
    return 
  }

  // 对元素子元素根据order进行排序
  const items = element.children.filters(e => e && e.style === 'element')
  items.sort((a, b) => {
    return (a.order || 0) - (b.order || 0)
  })

  const s = elementStyle
  // 初始化width,height的值
  ['width', 'height'].forEach(size => {
    if(s[size] === 'auto' || s[size] === '') {
      style[size] = null
    }
  });

  // 初始化flex相关属性
  if(!style.flexDirection || style.flexDirection === 'auto') {
    style.flexDirection = 'row'
  }
  if(!style.alignItems || style.alignItems === 'auto') {
    style.alignItems = 'stretch'
  }
  if(!style.justifyContent || style.justifyContent === 'auto') {
    style.justifyContent = 'stretch'
  }
  if(!style.alignContent || style.alignContent === 'auto') {
    style.alignContent = 'stretch'
  }

  // 初始化主轴，交叉轴参数
  let mainSize, mainStart, maninEnd, mainSign, mainBase,
    corssSize, corssStart, croseeEnd, crossSign, crossBase

  if(style.flexDirection === 'row') {
    mainSize = 'width'
    mainStart = 'left'
    mainEnd = 'right'
    mainSign = +1
    mainBase = 0

    corssSize = 'height'
    corssStart = 'top'
    crossEnd = 'bottom'
  } 
  if(style.flexDirection === 'row-reverse') {
    mainSize = 'width'
    mainStart = 'right'
    mainEnd = 'left'
    mainSign = -1
    mainBase = style.width

    corssSize = 'height'
    corssStart = 'top'
    crossEnd = 'bottom'
  }
  if(style.flexDirection === 'column') {
    mainSize = 'height'
    mainStart = 'top'
    mainEnd ='bottom'
    mainSign = +1
    mainBase = 0

    corssSize = 'width'
    corssStart = 'left'
    crossEnd = 'right'
  }
  if(style.flexDirection === 'column-reverse') {
    mainSize = 'height'
    mainStart = 'bottom'
    mainEnd ='top'
    mainSign = -1
    mainBase = style.height

    corssSize = 'width'
    corssStart = 'left'
    crossEnd = 'right'
  }

  // 包裹容器元素未定义宽度
  let isAutoMainSize = false
  if(!s[mainSize]) {
    s[mainSize] = 0
    for(let i = 0; i < items.length; i++) {
      if(items[i].style[mainSize]) {
        s[mainSize] += items[i].style[mainSize]
      }
    }
    console.log('isAutoMainSize true', s[mainSize])
    isAutoMainSize = true
  }


  /** 多行逻辑 **/
  const flexLine = []
  const flexLines = [flexLine]
  // 主轴，交叉轴剩余空间
  let mainSpace = elementStyle[mainSize]
  let crossSpace = 0

  for(let i = 0; i < items.length; i++) {
    let item = items[i]
    const itemStyle = getStyle(item)
    if(!itemStyle[mainSize]) {
      itemStyle[mainSize] = 0
    }





  }



}

module.exports = layout