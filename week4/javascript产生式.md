InputElement ::= WhiteSpace | LineTerminiator | Comment | Token

// 半角空格，全角空格
WhiteSpace ::= " " | " " 
LineTerminiator ::= "\n" | "\r"
Comment ::= SingleLineComment | MultiLineComment
SingleLineComment ::= "/""/" <any>*
MultiLineComment ::= "/""*" ([^*] | *[^/]) "*""/"
// 直接量 关键字 自定义变量 符号
Token ::= Literal | Keywords | Identifier | Punctuator 
Literal ::= NumberLiteral | BooleanLiteral | StringLiteral | NullLiteral
Keywords ::= "if" | "else" | "for" | "function"......
Punctuator ::= "+" | "-" | "*" | "/" | "{" | "}"

