const regexpMap = {
  inputElement: '<WhiteSpace>|<LineTerminator>|<Comments>',
  WhiteSpace: /[ ]+/,
  LineTerminator: /\n|\r\n/,
  // 如果有分组要用?: 取消捕获
  Comments: /\/\*(?:[^*]|\*[^\/])*\*\//
}


function compileRegexp(source, name) {
  if(source[name] instanceof RegExp) {
    return source[name].source
  }
  return source[name].replace(/\<([^\>]+)\>/g, (_name, $1) => {
    return '(' + compileRegexp(source, $1)  + ')'
  })
}

const r1 = compileRegexp(regexpMap, 'inputElement')
console.log(r1)

const table = {}
function compileRegexpWithTable(source, name, start) {
  if(source[name] instanceof RegExp) {
    return {
      source: source[name].source,
      length: 1
    }
  }
  let length = 1
  const regexp = source[name].replace(/\<([^\>]+)\>/g, (_name, $1) => {
    table[start+length] = _name
    const r = compileRegexpWithTable(source, $1, start+length)
    length += r.length
    return '(' + r.source  + ')'
  })
  return {
    source: regexp,
    length
  }
}

const r2 = compileRegexpWithTable(regexpMap, 'inputElement', 0)
console.log(r2, table)