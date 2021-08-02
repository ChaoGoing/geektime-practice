import { scan } from './Lexparser.js'

let syntax = {
  Program: [
    ['StatementList', 'EOF']
  ],
  StatementList: [
    ['Statement'],
    ['StatementList', 'Statement']
  ],
  Statement: [
    ['ExpressionStatement'],
    ['IfStatement'],
    ['VariableDeclaration'],
    ['FunctionDeclaration']
  ],
  IfStatement: [
    ['if', '(', 'Expression', ')', 'Statement']
  ],
  VariableDeclaration: [
    ['var', 'Identifier', ';']
  ],
  FunctionDecalration: [
    ['function', 'Identifier', '(', ')', '{', 'StatementList' ,'}']
  ],

  ExpressionStatement: [
    ['Expression', ';']
  ],
  Expression: [
    ['AdditiveExpression']
  ],
  AdditiveExpression: [
    ['MultiplcativeExpression'],
    ['AdditiveExpression', '+', 'MultiplicativeExpression'],
    ['AdditiveExpression', '-', 'MultiplicativeExpression'],
  ],
  MultiplicativeExpression: [
    ['PrimaryEXpression'],
    ['MultiplicativeExpression', '*', 'PrimaryExpression'],
    ['MultiplicativeExpression', '/', 'PrimaryExpression']
  ],
  PrimaryExpression: [
    ['(', 'Expression', ')'],
    ['Literal'],
    ['Identifier']
  ],
  Literal: [
    ['Number'],
    ['String'],
    ['Boolean'],
    ['Null'],
    ['RegularExpression'],
  ],
   
}

const hash = {}
const closeure = function(state) {
  hash[JSON.stringify(state)] = state
  const queue = []
  for(let symbol in state) {
    if(symbol.match(/^\$/)) {
      continue
    }
    queue.push(symbol)
  }
  while(queue.length) {
    const symbol = queue.shift()
    if(syntax[symbol]) {
      
      for(let rule of syntax[symbol]) {
        if(!state[rule[0]]) { // rule[0]都可以作为当前state的起始
          queue.push(rule[0])
        }
        let current = state
        for(let part of rule) {
          if(!current[part]) {
            current[part] = {}
            // 改变current的引用实现层级的递进
            current = current[part]
          }
        }
        current.$reduceType = symbol
        current.$reduceLength = rule.length
      }
    }
  }
  for(let symbol in state) {
    if(symbol.match(/^\$/)) {
      continue
    }
    const exist = hash[JSON.stringify(state[symbol])]
    if(exist) {
      // state[symbol] = hash.get(JSON.stringify(state))
      state[symbol] = hash[JSON.stringify(state[symbol])]
    }
    else {
      closeure(state[symbol])
    }
  }
}

let end = {
  $isEnd: true
}

let start = {
  'Program': end
}

closeure(start)
console.log(start)

let source = `
  var a;
`

function parse(source) {
  const stack = [start]
  const symbolStack = []
  function reduce() {
    let state = stack[stack.length-1]
    if(state.$reduceType) {
      let children = []
      for(let i = 0; i < state.$reduceLength; i++) {
        stack.pop()
        children.push(symbolStack.pop())
      }
      return {
        type: state.$reduceType,
        children: children.reverse()
      }
    }else {
      console.log('unexpected token' , state)
    }
  }
  function shift(symbol) {
    let state = stack[stack.length-1]
    if(symbol.type in state) {
      stack.push(state[symbol.type])
      symbolStack.push(symbol)
    }else {
      shift(reduce())
      shift(symbol)
    }
  }
  for(let symbol of scan(source)) {
    shift(symbol)
  }
  console.log(reduce())
  // return reduce()
}

parse(source)