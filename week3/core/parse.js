const EOF = Symbol("EOF")
const css = require("css")
const layout = require('./layout.js')

let currentToken = null
let curentAttribute = null
let currentTextNode = null

function match(element, selector) {
  if(!selector || !element.attributes) return false
  
  // id选择器
  if(selector.startsWith('#')) {
    const attr = element.attributes.find(attr => attr.name === 'id')
    return attr && attr.value === selector.replace('#', '')
  }else if(selector.startsWith('.')) {
    // 类名选择器
    const attr = element.attributes.find(attr => attr.name === 'class')
    const classes = attr && attr.value.split(" ")
     return classes && (classes.find(c => c === selector.replace('.', '')))
  }else {
    // tag
    return element.tagName === selector
  } 
}

let rules = []
function addCssRules(text) {
  const ast = css.parse(text)
  rules.push(...ast.stylesheet.rules)
}

function computedCSS(element) {
  const elements = stack.slice().reverse()
  if(!element.computedStyle) {
    element.computedStyle = {}
  }

  for(let rule of rules) {
    const selectorParts = rule.selectors[0].split(" ").reverse();
    if(!match(element, selectorParts[0])) {
      continue
    }
    let j = 1
    let matched = false
    for(let i = 0; i < element.length; i++) {
      if(match(element[i], selectorParts[i])) {
        j++
      }
    }
    if(j >= selectorParts.length) {
      matched = true
    }
    if(matched) {
      const computedStyle = element.computedStyle
      const sp = specificity(rule.selectors[0])
      for(let declaration of rule.declarations) {
        const property = declaration.property
        if(!computedStyle[property]) {
          computedStyle[property] = {}
        }
        if(!computedStyle[property].specificity || compare(computedStyle[property].specificity, sp) < 0) {
          computedStyle[property].value = declaration.value
          computedStyle[property].specificity = sp
        }
      }
    }
  }
}

function specificity(selector) {
  const p = [0,0,0,0]
  let selectorParts = selector.split(" ")
  for(let part of selectorParts) {
    if(part.charAt(0) === '#') {
      p[1]+=1
    }else if(part.charAt(0) === '.') {
      p[2] += 1
    }else {
      p[3] += 1
    }
  }
  return p
}

function compare(sp1, sp2) {
  if(sp1[0] - sp2[0]) {
    return sp1[0] - sp2
  }else if(sp1[1] - sp2[1]) {
    return sp1[1] - sp2[1]
  }else if(sp1[2] - sp2[2]) {
    return sp1[2] - sp2[2]
  }
  return sp1[3] - sp2[3]
}

let stack = [{ type: 'document', children: [] }]
function emit(token) {
  // console.log(token)
  let top = stack[stack.length - 1]
  if(token.type === 'startTag') {
    let element = {
      type: "element",
      children: [],
      attributes: [],
      tagName: token.tagName
    }
    for(let p in token) {
      if(p !== 'type' && p !== 'tagName') {
        element.attributes.push({
          name: p,
          value: token[p]
        })
      }
    }
    computedCSS(element)
    // console.log(JSON.stringify(element))
    top.children.push(element)
    element.parent = top
    if(!token.isSelfClosing) {
      stack.push(element)
    }
    currentTextNode = null
  }else if(token.type === 'endTag') {
    if(top.tagName !== token.tagName) {
      console.log("Tag start end doesot match")
      // throw new Error('Tag start end doesot match')
    }else {
      if(token.tagName === 'style') {
        addCssRules(top.children[0].content)
      }
      stack.pop()
    }
    layout(top)
    const attr = top.attributes.find(item => item.name === 'id')
    if(top.tagName === 'div' && attr &&  attr.value.includes('container')) {
      console.log(top)
    }
    currentTextNode = null
  }else if(token.type === 'text') {
    if(currentTextNode === null) {
      currentTextNode = {
        type: 'text',
        content: ''
      }
      top.children.push(currentTextNode)
    }else {
      currentTextNode.content += token.content
    }
  }
}

function data(c) {
  if(c === '<') {
    return tagOpen
  }else if(c === EOF){
    return 
  }else {
    emit({
      type: 'text',
      content: c
    })
    return data
  }
  
}

function tagOpen(c) {
  if(c === '/') {
    return endTagOpen
  }else if(c.match(/^[a-zA-Z]$/)) {
    currentToken = {
      type: 'startTag',
      tagName: ''
    }
    return tagName(c)
  }else {

  }
}

function endTagOpen(c) {
  if(c.match(/^[a-zA-Z]$/)){
    currentToken = {
      type: 'endTag',
      tagName: ''
    }
    return tagName(c)
  }else if(c === '>') {

  }else if(c === EOF) {

  }else {

  }
}

function tagName(c) {
  // 1.换行/tab/换页符\f/空格 
  if(c.match(/^[\n\t\f ]$/)) {
    return beforeAttributeName(c)
  }else if(c === '/') {
    return selfClosingStartTag
  }else if(c.match(/^[a-zA-Z]$/)) {
    currentToken.tagName += c
    return tagName
  }
  else if(c === '>') {
    emit(currentToken)
    return data
  }else {
    currentToken.tagName += c
    return tagName
  }
}

function beforeAttributeName(c) {
  if(c.match(/^[\n\t\f ]$/)) {
    return beforeAttributeName
  }else if(c === '/' || c === '>' || c === EOF) {
    return afterAttributeName(c)
  }else if(c === '=') {
    return EOF
  }else if(c === '>') {
    emit(currentToken)
    return data
  }else {
    currentAttribute = {
      name: '',
      value: ''
    }
    return attributeName(c)
  }
}

function attributeName(c) {
  if(c.match(/^[\t\n\f ]$/) || c === '/' || c==='>' || c===EOF) {
    return afterAttributeName
  }else if(c === '=') {
    return beforeAttributeValue
  }else if(c === '\u0000') {
    return 
  }else {
    currentAttribute.name += c
    return attributeName
  }
}

function afterAttributeName(c) {
  if(c.match(/^[\t\n\f ]$/)) {
    return afterAttributeName
  }else if(c === '/') {
    return selfClosingStartTag
  }else if(c === "=") {
    return beforeAttributeValue
  }else if(c === ">") {
    currentToken[currentAttribute.name] = currentAttribute.value
    emit(currentToken)
    return data
  }else if(c === EOF) {

  }else {
    currentToken[currentAttribute.name] = currentAttribute.value
    currentAttribute = {
      name: "",
      value: ""
    }
    return attributeName(c)
  }
}

function beforeAttributeValue(c) {
  if(c.match(/^[\t\n\f ]$/) || c === '/' || c === '>' || c === EOF) {
    return beforeAttributeValue
  }else if(c === '"') {
    return doubleQuotedAttributeValue
  }else if(c === "'") {
    return singleQuotedAttributeValue
  }else if(c === '>') {
    return EOF
  }else {
    return unQuotedAttributeValue(c)
  }e
}

function doubleQuotedAttributeValue(c) {
  if(c === '"') {
    currentToken[currentAttribute.name] = currentAttribute.value
    return afterQuotedAttributeValue
  }else if(c === '\u0000') {

  }else if(c === EOF) {

  }else {
    currentAttribute.value += c
    return doubleQuotedAttributeValue
  }
}

function singleQuotedAttributeValue(c) {
  if(c === "'") {
    currentToken[currentAttribute.name] = currentAttribute.value
    return afterQuotedAttributeValue
  }else if(c === '\u0000') {

  }else if(c === EOF) {

  }else {
    currentAttribute.value += c
    return singleQuotedAttributeValue
  }
}

function unQuotedAttributeValue(c) {
  if(c.match(/^[\n\t\f ]$/)) {
    currentToken[currentAttribute.name] = currentAttribute.value
    return beforeAttributeName
  }else if(c === '/'){
    currentToken[currentAttribute.name] = currentToken[currentAttribute.value]
    return selfClosingStartTag
  }else if(c === ">") {
    currentToken[currentAttribute.name] = currentToken[currentAttribute.value]
    emit(currentToken)
    return data
  }else if(c === '\u0000') {

  }
}

function afterQuotedAttributeValue(c) {
  if(c.match(/^[\n\t\f ]$/)) {
    return beforeAttributeName
  }else if(c === '/') {
    return selfClosingStartTag
  }else if(c === '>') {
    // currentToken[currentAttribute.name] = currentAttribute.value
    emit(currentToken)
    return data
  }else {
    return EOF
  }
}


function selfClosingStartTag(c) {
  if(c === '>') {
    currentToken.isSelfClosing = true
    return data
  }else if(c === EOF) {

  }else {
    
  }
}

module.exports.parseHTML = function parseHtml(html) {

  let state = data
  for(let c of html) {
    state = state(c)
  }
  state = state(EOF)
  return stack[0]
}