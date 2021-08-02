import XRegexp from './XRegexp.js';

let xregexp = {
  InputElement: "<WhiteSpace>|<Comments>|<LineTerminator>|<Token>",
  WhiteSpace: /[ ]+/,
  LineTerminator: /\n/,
  Comments: /\*[^\/]\/\*(?:[^*]|\*[^\/])*\*\/|\/\/[^\n]*/,
  Token: "<Literal>|<Keywords>|<Identifier>|<Punctuator>",
  Literal: "<NumricLiteral>|<BooleanLiteral>|<StringLiteral>|<NullLiteral>",
  NumricLiteral: /(?:[1-9][0-9]*|0)\.[0-9]*|.[0-9]+/,
  BooleanLiteral: /true|false/,
  StringLiteral: /\"(?:[^"\n]|\\[\s\S])*\"|\`(?:[^"\n]|\\[\s\S])*\`/,
  NullLiteral: /null/,
  Identifier: /[a-zA-z_$][a-zA-Z0-9a_$]*/,
  Keywords: /if|else|for|function|any|try|catch|var|let|const/,
  Punctuator: /\+|\,|\?|\(|=|\+\+|==|=>|<|\.|\)|\[|\]|;|\*|\}|\{/,
};

export function* scan(str) {
  const regexp = new XRegexp(xregexp, "g", "InputElement");
  // 正则的修饰符g 不能漏
  // let regexp = / |\n|\*[^\/]\/\*([^*]|\*[^\/])*\*\/|\/\/*[^\n]*|[1-9][0-9*]|0/g
  while (regexp.lastIndex < str.length) {
    const r = regexp.exec(str);
    console.log(r)

    // yield 支持for/of iterator
    try{
      if(r.WhiteSpace) {
        
      }else if(r.LineTerminator) {
        
      }else if (r.NumricLiteral) {
        yield {
          type: 'StringLiteral',
          value: r[0],
        }
      }else if (r.BooleanLiteral) {
        yield {
          type: 'BooleanLiteral',
          value: r[0],
        }
      }else if (r.StringLiteral) {
        yield {
          type: 'StringLiteral',
          value: r[0],
        }
      }else if(r.NullLiteral) {
        yield {
          type: 'NullLiteral',
          value: null
        }
      }else if(r.Identifier) {
        yield {
          type: 'Identifier',
          name: r[0]
        }
      }else if(r.Punctuator) {
        yield {
          type: r[0]
        }
      }else if(r.Keywords) {
        yield {
          type: r[0]
        }
      } else {
        throw new Error('unexpected token' + r[0])
      }

    }catch(e) {
      console.log(e)
    }
    if (!r || !r.length) break;
  }
  yield {
    type: 'EOF',
  }
}

const source = `
  for(let i = 0; i<3; i++) {

  }
  function getStyle(ele) {
    if(!ele.style) {
      ele.style = {}
    }
    for(let prop in ele.computedStyle) {
      const p = ele.computedStyle[prop].value
      ele.style[prop] = p
      if(p) {
        ele.style[prop] = parseInt(p)
      }
    }
    return ele.style
  }`

// for(let token of scan(source)) {
//   console.log(token)
// }