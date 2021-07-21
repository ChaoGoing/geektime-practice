(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('images'), require('net'), require('css')) :
  typeof define === 'function' && define.amd ? define(['images', 'net', 'css'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.client = factory(global.require$$0$1, global.require$$1, global.require$$0));
}(this, (function (require$$0$1, require$$1, require$$0) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var require$$0__default$1 = /*#__PURE__*/_interopDefaultLegacy(require$$0$1);
  var require$$1__default = /*#__PURE__*/_interopDefaultLegacy(require$$1);
  var require$$0__default = /*#__PURE__*/_interopDefaultLegacy(require$$0);

  var client = {};

  var parse = {};

  function getStyle(ele) {
    if(!ele.style) {
      ele.style = {};
    }
    for(let prop in ele.computedStyle) {
      const p = ele.computedStyle[prop].value;
      ele.style[prop] = p;
      if(p.toString().match(/px$/) || p.toString().match(/^[0-9\.]+$/)) {
        ele.style[prop] = parseInt(p);
      }
    }
    return ele.style
  }


  function layout$1(element) {
    if(!element.computedStyle) {
      return
    }

    const elementStyle = getStyle(element);
    if(elementStyle.display !== 'flex') {
      return 
    }

    // 对元素子元素根据order进行排序
    const items = element.children.filter(e => e && e.type === 'element');
    items.sort((a, b) => {
      return (a.order || 0) - (b.order || 0)
    });

    const s = elementStyle;
    // 初始化width,height的值
    const arr = ['width', 'height'];
    arr.forEach(size => {
      if(s[size] === 'auto' || s[size] === '') {
        s[size] = null;
      }
    });

    // 初始化flex相关属性
    if(!s.flexDirection || s.flexDirection === 'auto') {
      s.flexDirection = 'row';
    }
    if(!s.alignItems || s.alignItems === 'auto') {
      s.alignItems = 'stretch';
    }
    if(!s.justifyContent || s.justifyContent === 'auto') {
      s.justifyContent = 'stretch';
    }
    if(!s.alignContent || s.alignContent === 'auto') {
      s.alignContent = 'stretch';
    }

    // 初始化主轴，交叉轴参数
    let mainSize, mainStart, mainSign, mainBase,
      corssSize;

    if(s.flexDirection === 'row') {
      mainSize = 'width';
      mainStart = 'left';
      mainEnd = 'right';
      mainSign = +1;
      mainBase = 0;

      corssSize = 'height';
      crossEnd = 'bottom';
    } 
    if(s.flexDirection === 'row-reverse') {
      mainSize = 'width';
      mainStart = 'right';
      mainEnd = 'left';
      mainSign = -1;
      mainBase = s.width;

      corssSize = 'height';
      crossEnd = 'bottom';
    }
    if(s.flexDirection === 'column') {
      mainSize = 'height';
      mainStart = 'top';
      mainEnd ='bottom';
      mainSign = +1;
      mainBase = 0;

      corssSize = 'width';
      crossEnd = 'right';
    }
    if(s.flexDirection === 'column-reverse') {
      mainSize = 'height';
      mainStart = 'bottom';
      mainEnd ='top';
      mainSign = -1;
      mainBase = s.height;

      corssSize = 'width';
      crossEnd = 'right';
    }

    // 包裹容器元素未定义宽度
    let isAutoMainSize = false;
    if(!s[mainSize]) {
      s[mainSize] = 0;
      for(let i = 0; i < items.length; i++) {
        if(items[i].style[mainSize]) {
          s[mainSize] += items[i].style[mainSize];
        }
      }
      console.log('isAutoMainSize true', s[mainSize]);
      isAutoMainSize = true;
    }


    /** 多行逻辑 **/
    let flexLine = [];
    let flexLines = [flexLine];
    // 主轴，交叉轴剩余空间
    let mainSpace = elementStyle[mainSize];
    let crossSpace = 0;

    for(let i = 0; i < items.length; i++) {
      let item = items[i];
      const itemStyle = getStyle(item);
      if(!itemStyle[mainSize]) {
        itemStyle[mainSize] = 0;
      }

      if(itemStyle.flex) {
        flexLine.push(item);
      }else if(s.flexWrap = isAutoMainSize) {
        mainSpace -= itemStyle[mainSize];
        if(itemStyle[corssSize]) {
          crossSpace = Math.max(crossSpace, itemStyle[corssSize]);
        }
        flexLine.push(item);
      }else {
        if(itemStyle[mainSize] > s[mainSize]) {
          itemStyle = s[mainSize];
        }
        if(mainSpace < itemStyle[mainSize]) {
          flexLine.mainSpace = mainSpace;
          flexLine.crossSpace = crossSpace;
          flexLine = [item];
          flexLines.push(flexLine);
          mainSpace = s[mainSize];
          crossSpace = 0;
        }else {
          flexLine.push(item);
        }
        if(itemStyle[corssSize]) {
          crossSpace = Math.max(crossSpace, itemStyle[corssSize]);
        }
        mainSpace -= itemStyle[mainSize];
      }

    }
    // 处理最后一行的crossSpace和mainSpace
    flexLine.mainSpace = mainSpace;
    if(s.flexWrap === 'nowrap' || isAutoMainSize) {
      flexLine.crossSpace = s[corssSize] ? s[corssSize] : crossSpace;
    }else {
      flexLine.crossSpace = crossSpace;
    }
   
    if(mainSpace < 0) { // nowrap & 子元素总宽度 大于 父元素宽度
      const scale = s[mainSize] / (s[mainSize] - mainSpace);
      let currentMain = mainBase;
      for(let i = 0; i < items.length; i++) {
        const item = items[i];
        const itemStyle = getStyle(item);
        if(itemStyle.flex) {
          itemStyle[mainSize] = 0;
        }
        itemStyle[mainSize] = itemStyle[mainSize] * scale;
        itemStyle[mainStart] = currentMain;
        itemStyle[mainEnd] = itemStyle[mainStart] + itemStyle[mainSize] * mainSign;
        currentMain = itemStyle[mainEnd];
      }
    }else {

      flexLines.forEach(items => {
        const _mainSpace = items.mainSpace;
        let flexTotal = 0;
        // 统计flex元素的个数
        for(let i = 0; i < items.length; i++) {
          const item = items[i];
          const itemStyle = getStyle(item);
          if(itemStyle.flex) {
            flexTotal += itemStyle.flex;
            // continue
          }
        }
        if(flexTotal > 0) { // 有flex情况下
          let currentMain = mainBase;
          for(let i = 0; i < items.length; i++) {
            const item = items[i];
            const itemStyle = getStyle(item);
            if(itemStyle.flex) {
              itemStyle[mainSize] = (_mainSpace / flexTotal) * itemStyle.flex;
            }
            itemStyle[mainStart] = currentMain;
            itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
            currentMain = itemStyle[mainEnd];
          }
        }else { // 无flex元素下根据justify-content进行排版
          let currentMain, step = 0;
          if(s.justifyContent === 'flex-start') {
            currentMain = mainBase;
            step = 0;
          }
          if(s.justifyContent === 'flex-end') {
            currentMain = mainBase + _mainSpace * mainSign;
            step = 0;
          }
          if(s.justifyContent === 'center') {
            currentMain = mainSpace / 2 * mainSign + mainBase;
            step = 0;
          }
          if(s.justifyContent === 'space-between') {
            step = mainSpace / (items.length-1) * mainSign;
            currentMain = mainBase;
          }
          if(s.justifyContent === 'space-around') {
            step = mainSpace / (items.length) * mainSign;
            currentMain = mainBase + step / 2;
          }

          for(let i = 0; i < items.length; i++) {
            const item = items[i];
            itemStyle = getStyle(item);
            itemStyle[mainStart] = currentMain;
            itemStyle[mainEnd] = itemStyle[mainStart] + itemStyle[mainSize] * mainSign;
            currentMain = itemStyle[mainEnd] + step;
          }
        
        }

      });

    }

  }

  var layout_1 = layout$1;

  const EOF = Symbol("EOF");
  const css = require$$0__default['default'];
  const layout = layout_1;

  let currentToken = null;
  let currentTextNode = null;

  function toCamelCase(str) {
    return str.replace(/(-[a-z])/g, (c) => {
      return c.slice(1).toUpperCase()
    })
  }

  function match(element, selector) {
    if(!selector || !element.attributes) return false
    
    // id选择器
    if(selector.startsWith('#')) {
      const attr = element.attributes.find(attr => attr.name === 'id');
      return attr && attr.value === selector.replace('#', '')
    }else if(selector.startsWith('.')) {
      // 类名选择器
      const attr = element.attributes.find(attr => attr.name === 'class');
      const classes = attr && attr.value.split(" ");
      return classes && (classes.find(c => c === selector.replace('.', '')))
    }else {
      // tag
      return element.tagName === selector
    } 
  }

  let rules = [];
  function addCssRules(text) {
    const ast = css.parse(text);
    rules.push(...ast.stylesheet.rules);
  }

  function computedCSS(element) {
    const elements = stack.slice().reverse();
    if(!element.computedStyle) {
      element.computedStyle = {};
    }

    for(let rule of rules) {
      const selectorParts = rule.selectors[0].split(" ").reverse();
      const __match = match(element, selectorParts[0]);
      if(!__match) {
        continue
      }
      let j = 1;
      let matched = false;
      for(let i = 0; i < elements.length; i++) {
        if(match(elements[i], selectorParts[j])) {
          j++;
        }
      }
      if(j >= selectorParts.length) {
        matched = true;
      }
      if(matched) {
        const computedStyle = element.computedStyle;
        const sp = specificity(rule.selectors[0]);
        for(let declaration of rule.declarations) {
          const property = toCamelCase(declaration.property);
          if(!computedStyle[property]) {
            computedStyle[property] = {};
          }
          if(!computedStyle[property].specificity || compare(computedStyle[property].specificity, sp) < 0) {
            computedStyle[property].value = declaration.value;
            computedStyle[property].specificity = sp;
          }
        }
      }
    }
  }

  function specificity(selector) {
    const p = [0,0,0,0];
    let selectorParts = selector.split(" ");
    for(let part of selectorParts) {
      if(part.charAt(0) === '#') {
        p[1]+=1;
      }else if(part.charAt(0) === '.') {
        p[2] += 1;
      }else {
        p[3] += 1;
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

  let stack = [{ type: 'document', children: [] }];
  function emit(token) {
    // console.log(token)
    let top = stack[stack.length - 1];
    if(token.type === 'startTag') {
      let element = {
        type: "element",
        children: [],
        attributes: [],
        tagName: token.tagName
      };
      for(let p in token) {
        if(p !== 'type' && p !== 'tagName') {
          element.attributes.push({
            name: p,
            value: token[p]
          });
        }
      }
      computedCSS(element);
      // console.log(JSON.stringify(element))
      top.children.push(element);
      element.parent = top;
      if(!token.isSelfClosing) {
        stack.push(element);
      }
      currentTextNode = null;
    }else if(token.type === 'endTag') {
      if(top.tagName !== token.tagName) {
        console.log("Tag start end doesot match");
        // throw new Error('Tag start end doesot match')
      }else {
        if(token.tagName === 'style') {
          addCssRules(top.children[0].content);
        }
        stack.pop();
      }
      top.attributes.find(item => item.name === 'id');
      // if(top.tagName === 'div' && attr &&  attr.value.includes('container')) {
      //   console.log(top)
      // }
      layout(top);
      
      
      currentTextNode = null;
    }else if(token.type === 'text') {
      if(currentTextNode === null) {
        currentTextNode = {
          type: 'text',
          content: ''
        };
        top.children.push(currentTextNode);
      }else {
        currentTextNode.content += token.content;
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
      });
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
      };
      return tagName(c)
    }else ;
  }

  function endTagOpen(c) {
    if(c.match(/^[a-zA-Z]$/)){
      currentToken = {
        type: 'endTag',
        tagName: ''
      };
      return tagName(c)
    }
  }

  function tagName(c) {
    // 1.换行/tab/换页符\f/空格 
    if(c.match(/^[\n\t\f ]$/)) {
      return beforeAttributeName(c)
    }else if(c === '/') {
      return selfClosingStartTag
    }else if(c.match(/^[a-zA-Z]$/)) {
      currentToken.tagName += c;
      return tagName
    }
    else if(c === '>') {
      emit(currentToken);
      return data
    }else {
      currentToken.tagName += c;
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
      emit(currentToken);
      return data
    }else {
      currentAttribute = {
        name: '',
        value: ''
      };
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
      currentAttribute.name += c;
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
      currentToken[currentAttribute.name] = currentAttribute.value;
      emit(currentToken);
      return data
    }else if(c === EOF) ;else {
      currentToken[currentAttribute.name] = currentAttribute.value;
      currentAttribute = {
        name: "",
        value: ""
      };
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
    }}

  function doubleQuotedAttributeValue(c) {
    if(c === '"') {
      currentToken[currentAttribute.name] = currentAttribute.value;
      return afterQuotedAttributeValue
    }else if(c === '\u0000') ;else if(c === EOF) ;else {
      currentAttribute.value += c;
      return doubleQuotedAttributeValue
    }
  }

  function singleQuotedAttributeValue(c) {
    if(c === "'") {
      currentToken[currentAttribute.name] = currentAttribute.value;
      return afterQuotedAttributeValue
    }else if(c === '\u0000') ;else if(c === EOF) ;else {
      currentAttribute.value += c;
      return singleQuotedAttributeValue
    }
  }

  function unQuotedAttributeValue(c) {
    if(c.match(/^[\n\t\f ]$/)) {
      currentToken[currentAttribute.name] = currentAttribute.value;
      return beforeAttributeName
    }else if(c === '/'){
      currentToken[currentAttribute.name] = currentToken[currentAttribute.value];
      return selfClosingStartTag
    }else if(c === ">") {
      currentToken[currentAttribute.name] = currentToken[currentAttribute.value];
      emit(currentToken);
      return data
    }else ;
  }

  function afterQuotedAttributeValue(c) {
    if(c.match(/^[\n\t\f ]$/)) {
      return beforeAttributeName
    }else if(c === '/') {
      return selfClosingStartTag
    }else if(c === '>') {
      // currentToken[currentAttribute.name] = currentAttribute.value
      emit(currentToken);
      return data
    }else {
      return EOF
    }
  }


  function selfClosingStartTag(c) {
    if(c === '>') {
      currentToken.isSelfClosing = true;
      return data
    }
  }

  parse.parseHTML = function parseHtml(html) {

    let state = data;
    for(let c of html) {
      state = state(c);
    }
    state = state(EOF);
    return stack[0]
  };

  var render$1 = {};

  const images$1 = require$$0__default$1['default'];

  render$1.render = function render(viewport, element) {
    console.log(element.style);
    if(element.style) {
      const img = images$1(element.style.width, element.style.height || 200);
      if(element.style['backgroundColor']) {
        const color = element.style['backgroundColor'] || 'rgb(0,0,0)';
        color.match(/rgb\((\d+),(\d+),(\d+)\)/);
        console.log(Number(RegExp.$1), Number(RegExp.$2), Number(RegExp.$3));
        img.fill(Number(RegExp.$1), Number(RegExp.$2), Number(RegExp.$3));
        viewport.draw(img, element.style.left || 0, element.style.top || 0);
      }
    }

    if(element.children) {
      for(let child of element.children) {
        render(viewport, child);
      }
    }
  };

  render$1.renderCanvas = function render() {
    console.log("dom", dom);
  };

  const images = require$$0__default$1['default'];
  const net = require$$1__default['default'];
  const parser = parse;
  const {renderCanvas, render} = render$1;

  class Request{
    constructor(options) {
      this.method = options.method || 'GET';
      this.host = options.host;
      this.port = options.port || 80;
      this.path = options.path || '/';
      this.body = options.body || {};
      this.headers = options.headers || {};
      if(!this.headers["Content-Type"]) {
        this.headers["Content-Type"] = "application/x-www-form-urlencoded";
      }
      if(this.headers["Content-Type"] === "application/json") {
        this.bodyText = JSON.stringify(this.body);
      }else {
        this.bodyText = Object.keys(this.body).map(key => `${key}=${encodeURIComponent(this.body[key])}`).join('&');
      }
      this.headers["Content-Length"] = this.bodyText.length;
    }

    send(connection) {
      return new Promise((resolve, reject) => {
        const parser =  new ResponseParser();
        if(connection) {
          connection.write(this.toString());
        }else {
          connection = net.createConnection({
            host: this.host,
            port: this.port
          }, () => {
            connection.write(this.toString());
          });
        }
        connection.on('data', (data) => {
          console.log(data.toString());
          parser.receive(data.toString());
          if(parser.isFinished) {
            resolve(parser.response);
            connection.end();
          }
        });
        connection.on('error', (err) => {
          console.log(err);
          reject(err);
          connection.end();
        });
      })
    }

    toString() {
      return `${this.method} ${this.path} HTTP/1.1\r
${Object.keys(this.headers).map(key => `${key}: ${this.headers[key]}`).join('\r\n')}\r
\r
${this.bodyText}`
    }
  }

  class ResponseParser {
    constructor() {
      this.WAITING_STATUS_LINE = 0;
      this.WAITING_STATUS_LINE_END = 1;
      this.WAITING_HEADER_NAME = 2;
      this.WAITING_HEADER_SPACE = 3;
      this.WAITING_HEADER_VALUE = 4;
      this.WAITING_HEADER_LINE_END = 5;
      this.WAITING_HEADER_BLOCK_END = 6;
      this.WAITING_BODY =7; 
      this.current = this.WAITING_STATUS_LINE;
      this.statusLine = "";
      this.headers = {};
      this.headerName = "";
      this.headerValue = "";
      this.bodyParser = null;
    }
    receive(string) {
      for(let i = 0; i < string.length; i++) {
        this.receiveChar(string.charAt(i));
      }
    }
    receiveChar(char) {
      if(this.current === this.WAITING_STATUS_LINE){
        if(char === '\r') {
          this.current = this.WAITING_HEADER_LINE_END;
        }else {
          this.statusLine += char;
        }
      }else if(this.current === this.WAITING_STATUS_LINE_END) {
        if(char === '\n') {
          this.current = this.WAITING_HEADER_NAME;
        }
      }else if(this.current === this.WAITING_HEADER_NAME) {
        if(char === ':') {
          this.current = this.WAITING_HEADER_SPACE;
        }else if(char === '\r') {
          this.current = this.WAITING_HEADER_BLOCK_END;
          if(this.headers['Transfer-Encoding'] === 'chunked') {
            this.bodyParser = new TrunkedBodyParser();
          }
        }else {
          this.headerName += char;
        }

      }else if(this.current === this.WAITING_HEADER_SPACE) {
        if(char === ' ') {
          this.current = this.WAITING_HEADER_VALUE;
        }
      }else if(this.current === this.WAITING_HEADER_VALUE) {
        if(char === '\r') {
          this.current = this.WAITING_HEADER_LINE_END;
          this.headers[this.headerName] = this.headerValue;
          this.headerName = "";
          this.headerValue = "";
        }else {
          this.headerValue += char;
        }
      }else if(this.current === this.WAITING_HEADER_LINE_END) {
        if(char === '\n') {
          this.current = this.WAITING_HEADER_NAME;
        }
      }else if(this.current === this.WAITING_HEADER_BLOCK_END) {
        if(char === '\n') {
          this.current = this.WAITING_BODY;
        }
      }else if(this.current === this.WAITING_BODY) {
        this.bodyParser.receiveChar(char);
      }
    }
    isFinished() {
      return this.bodyParser && this.bodyParser.isFinished
    }
    get response() {
      this.statusLine.match(/HTTP\/1.1 ([0-9]+) ([\s\S]+)/);
      return {
        statusCode: RegExp.$1,
        statusText: RegExp.$2,
        headers: this.headers,
        body: this.bodyParser.content.join('')
      }
    }
  }

  class TrunkedBodyParser {
    constructor() {
      this.WAITING_LENGTH = 0;
      this.WAITING_LENGTH_LINE_END = 1;
      this.READING_TRUNK = 2;
      this.WAITING_NEW_LINE = 3;
      this.WAITING_NEW_LINE_END = 4;
      this.length = 0;
      this.content = [];
      this.isFinished = false;
      this.current = this.WAITING_LENGTH;
    }
    receiveChar(char) {
      if(this.current === this.WAITING_LENGTH) {
        if(char === '\r') {
          if(this.length === 0) {
            this.isFinished = true;
          }
          this.current = this.WAITING_LENGTH_LINE_END;
        }else {
          this.length *= 16; // 不懂
          this.length += parseInt(char, 16);
        }
      }else if(this.current === this.WAITING_LENGTH_LINE_END) {
        if(char === '\n') {
          this.current = this.READING_TRUNK;
        }
      }else if(this.current === this.READING_TRUNK) {
        this.content.push(char);
        this.length--;
        if(this.length === 0) {
          this.current = this.WAITING_NEW_LINE;
        }
      }else if(this.current === this.WAITING_NEW_LINE) {
        if(char === '\r') {
          this.current = this.WAITING_NEW_LINE_END;
        }
      }else if(this.current === this.WAITING_NEW_LINE_END) {
        if(char === '\n') {
          this.current = this.WAITING_LENGTH;
        }
      }
    }
  }

  (async function() {
    const request = new Request({
      method: 'POST',
      host: '127.0.0.1',
      port: '8088',
      path: '/',
      headers: {
        // ["X-Foo2"]: "customed"
      },
      body: {
        name: 'chao'
      }
    });
    let response = await request.send();
    // console.log(response)
    const dom = parser.parseHTML(response.body);
    const viewport = images(600, 800);
    // console.log(dom.children[0].children[5].children[3])
    render(viewport, dom.children[0]);
    viewport.save("viewport.jpg");
    // renderCanvas(dom)
  })();

  return client;

})));
