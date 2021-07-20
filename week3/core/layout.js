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

function isEmpty(item) {
  return item === null || item === (void 0) 
}


function layout(element) {
  if(!element.computedStyle) {
    return
  }

  const elementStyle = getStyle(element);
  if(elementStyle.display !== 'flex') {
    return 
  }

  // 对元素子元素根据order进行排序
  const items = element.children.filter(e => e && e.type === 'element')
  items.sort((a, b) => {
    return (a.order || 0) - (b.order || 0)
  })

  const s = elementStyle
  // 初始化width,height的值
  const arr = ['width', 'height']
  arr.forEach(size => {
    if(s[size] === 'auto' || s[size] === '') {
      s[size] = null
    }
  });

  // 初始化flex相关属性
  if(!s.flexDirection || s.flexDirection === 'auto') {
    s.flexDirection = 'row'
  }
  if(!s.alignItems || s.alignItems === 'auto') {
    s.alignItems = 'stretch'
  }
  if(!s.justifyContent || s.justifyContent === 'auto') {
    s.justifyContent = 'stretch'
  }
  if(!s.alignContent || s.alignContent === 'auto') {
    s.alignContent = 'stretch'
  }

  // 初始化主轴，交叉轴参数
  let mainSize, mainStart, maninEnd, mainSign, mainBase,
    corssSize, corssStart, croseeEnd, crossSign, crossBase

  if(s.flexDirection === 'row') {
    mainSize = 'width'
    mainStart = 'left'
    mainEnd = 'right'
    mainSign = +1
    mainBase = 0

    corssSize = 'height'
    corssStart = 'top'
    crossEnd = 'bottom'
  } 
  if(s.flexDirection === 'row-reverse') {
    mainSize = 'width'
    mainStart = 'right'
    mainEnd = 'left'
    mainSign = -1
    mainBase = s.width

    corssSize = 'height'
    corssStart = 'top'
    crossEnd = 'bottom'
  }
  if(s.flexDirection === 'column') {
    mainSize = 'height'
    mainStart = 'top'
    mainEnd ='bottom'
    mainSign = +1
    mainBase = 0

    corssSize = 'width'
    corssStart = 'left'
    crossEnd = 'right'
  }
  if(s.flexDirection === 'column-reverse') {
    mainSize = 'height'
    mainStart = 'bottom'
    mainEnd ='top'
    mainSign = -1
    mainBase = s.height

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
  let flexLine = []
  let flexLines = [flexLine]
  // 主轴，交叉轴剩余空间
  let mainSpace = elementStyle[mainSize]
  let crossSpace = 0

  for(let i = 0; i < items.length; i++) {
    let item = items[i]
    const itemStyle = getStyle(item)
    if(!itemStyle[mainSize]) {
      itemStyle[mainSize] = 0
    }

    if(itemStyle.flex) {
      flexLine.push(item)
    }else if(s.flexWrap = 'nowrap' && isAutoMainSize) {
      mainSpace -= itemStyle[mainSize]
      if(itemStyle[corssSize]) {
        crossSpace = Math.max(crossSpace, itemStyle[corssSize])
      }
      flexLine.push(item)
    }else {
      if(itemStyle[mainSize] > s[mainSize]) {
        itemStyle = s[mainSize]
      }
      if(mainSpace < itemStyle[mainSize]) {
        flexLine.mainSpace = mainSpace
        flexLine.crossSpace = crossSpace
        flexLine = [item]
        flexLines.push(flexLine)
        mainSpace = s[mainSize]
        crossSpace = 0
      }else {
        flexLine.push(item)
      }
      if(itemStyle[corssSize]) {
        crossSpace = Math.max(crossSpace, itemStyle[corssSize])
      }
      mainSpace -= itemStyle[mainSize]
    }

  }
  // 处理最后一行的crossSpace和mainSpace
  flexLine.mainSpace = mainSpace
  if(s.flexWrap === 'nowrap' || isAutoMainSize) {
    flexLine.crossSpace = s[corssSize] ? s[corssSize] : crossSpace
  }else {
    flexLine.crossSpace = crossSpace
  }
 
  if(mainSpace < 0) { // nowrap & 子元素总宽度 大于 父元素宽度
    const scale = s[mainSize] / (s[mainSize] - mainSpace)
    let currentMain = mainBase
    for(let i = 0; i < items.length; i++) {
      const item = items[i]
      const itemStyle = getStyle(item)
      if(itemStyle.flex) {
        itemStyle[mainSize] = 0
      }
      itemStyle[mainSize] = itemStyle[mainSize] * scale
      itemStyle[mainStart] = currentMain
      itemStyle[mainEnd] = itemStyle[mainStart] + itemStyle[mainSize] * mainSign
      currentMain = itemStyle[mainEnd]
    }
  }else {

    flexLines.forEach(items => {
      const _mainSpace = items.mainSpace
      let flexTotal = 0
      // 统计flex元素的个数
      for(let i = 0; i < items.length; i++) {
        const item = items[i]
        const itemStyle = getStyle(item)
        if(itemStyle.flex) {
          flexTotal += itemStyle.flex
          // continue
        }
      }
      if(flexTotal > 0) { // 有flex情况下
        let currentMain = mainBase
        for(let i = 0; i < items.length; i++) {
          const item = items[i]
          const itemStyle = getStyle(item)
          if(itemStyle.flex) {
            itemStyle[mainSize] = (_mainSpace / flexTotal) * itemStyle.flex
          }
          itemStyle[mainStart] = currentMain
          itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize]
          currentMain = itemStyle[mainEnd]
        }
      }else { // 无flex元素下根据justify-content进行排版
        let currentMain, step = 0
        if(s.justifyContent === 'flex-start') {
          currentMain = mainBase
          step = 0
        }
        if(s.justifyContent === 'flex-end') {
          currentMain = mainBase + _mainSpace * mainSign
          step = 0
        }
        if(s.justifyContent === 'center') {
          currentMain = mainSpace / 2 * mainSign + mainBase
          step = 0
        }
        if(s.justifyContent === 'space-between') {
          step = mainSpace / (items.length-1) * mainSign
          currentMain = mainBase
        }
        if(s.justifyContent === 'space-around') {
          step = mainSpace / (items.length) * mainSign
          currentMain = mainBase + step / 2
        }

        for(let i = 0; i < items.length; i++) {
          const item = items[i]
          itemStyle = getStyle(item)
          itemStyle[mainStart] = currentMain
          itemStyle[mainEnd] = itemStyle[mainStart] + itemStyle[mainSize] * mainSign
          currentMain = itemStyle[mainEnd] + step
        }
      
      }

    })

  }

}

module.exports = layout