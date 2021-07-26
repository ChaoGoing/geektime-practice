class XRegexp{

  constructor(source, flag, root='root') {
    this.map = new Map()
    this.regexp = new RegExp(this.complie(source, root, 0).source, flag)
    console.log(this.map)
    console.log(this.regexp)
  }

  complie(source, name, start) {
    if(source[name] instanceof RegExp) {
      return {
        source: source[name].source,
        length: 0
      }
    }
    // length的作用: 将map的索引和正则exec捕获的分组索引对应
    let length = 0
    let regexp = source[name].replace(/\<([^\>]+)\>/g, (str, $1) => {
      this.map.set(start + length, $1)
      length++
      
      let r = this.complie(source, $1, start + length)
      length += r.length
      
      return '(' + r.source + ')'
    })
    return {
      source: regexp,
      length: length
    }
  }

  exec(string) {
    const r = this.regexp.exec(string)
    for(let i = 1; i<r.length; i++) {
      if(r[i] !== void 0) {
        r[this.map.get(i - 1)] = r[i]
      }
    }
    return r
  }

  get lastIndex() {
    return this.regexp.lastIndex
  }

  set lastIndex(val) {
    return this.regexp.lastIndex = val
  }

}

