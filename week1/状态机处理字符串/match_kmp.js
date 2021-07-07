// next 常规动态规划实现
function next_bp(str) {
  const next = [-1]
  for(let i = 1; i < str.length-1; i++) {
    if(str[next[i-1]+1] === str[i]) {
      next[i] = next[i-1] + 1
    }else {
      next[i] = -1
    }
  }
  return next
}
// console.log(next_bp("aabaa"))

// next 正常写法
function next_normal(str) {
  const next = [-1]
  let k = -1
  for(let i = 1; i < str.length-1; i++) {
    while(k!==1 && str[k+1] !== str[i]) {
      k = next[k]
    }
    if(str[k] === str[i]) {
      k++
    }
    next[i] = k
  }
  return next
}
// console.log(next_normal("aabaa"))


// 主逻辑
function kmp_normal(mainstr, costr) {
  const mlen = mainstr.length, clen = costr.length

  let next = next_bp(costr)

  let j = 0;

  for(let i = 0; i < mainstr.length; i++) {
    while(j > 0 && mainstr[i] !== costr[j])  {
      // console.log(j, next[j-1])
      j = next[j-1] + 1
    }
    if(mainstr[i] === costr[j]) {
      j++
    }
    if(j === clen) {
      return i - clen + 1
    }
  }
  return -1
}




// kmp 状态机
function getDfa(str) {
  const len = str.length 
  const dfa = new Array(len).fill(1).map(_ => ({  }))
  // console.log(dfa)
  let x = 0
  dfa[0][str[0]] = 1

  for(let i = 1; i < len; i++) {
    for(let char of str) {
      dfa[i][char] = dfa[x][char] || 0
    }
    dfa[i][str[i]] = i+1
    
    x = dfa[x][str[i]] || 0
    // console.log(i, dfa[i], x)
  }
  return dfa
}
console.log(getDfa("dede"))

function kmp_state(main, pat) {
  const dfa = getDfa(pat)
  let state = 0
  let j = 0, i = 0
  while(i<main.length && j<pat.length) {
    // console.log(i,j)
    j = dfa[j][main[i]] || 0
    i++ 
  }
  if(j === pat.length) {
    return i - j
  }
  return -1
}

console.log(kmp_normal("abcdadedef", "dede"))
console.log(kmp_state("abcdadedef", "dede"))
