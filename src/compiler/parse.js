export default function parse(template) {
  // 最终返回的 ast
  let root = null
  // 备份
  let html = template

  // 遍历 html 模板字符串
  while (html.trim()) {
    if (html.indexOf('<!--') === 0) {
      // 注释标签
      // 找到注释节点结束位置  <-- 注释标签 -->
      const endIndex = html.indexOf('-->')
      html = html.slice(endIndex + 3)
      continue
    }
    if (html.indexOf('<') === 0) {
      // 匹配到正常标签 <div id='app'></div>
      if (html.indexOf('</') === 0) {
        // 结束标签
        parseEnd()
      } else {
        // 开始标签
        parseStartTag()
      }
    } else if (html.indexOf('<') > 0) {
      // 在开始标签之前有文本 <div id='app'>text</div>
    } else {
      // 整个模板中没有标签信息，一段纯文本
    }
  }
}

/**
 * 处理开始标签
 *  如： <div id='app'></div>、<h3></h3>
 */
function parseStartTag() {
  // 匹配开始标签中的结束位置  <div id='app'>
  const endIdx = html.indexOf('>')
  // 获取开始标签内的所有内容   div id='app'
  const content = html.slice(1, endIdx)
  let tagName = ''
  let attrStr = ''
  // 找到 content 中的第一个空格
  const firstSpaceIdx = content.indexOf(' ')
  if (firstSpaceIdx === -1) {
    // 没找到，说明标签没属性
    tagName = content
  } else {
    // 标签名
    tagName = content.slice(0, firstSpaceIdx)
    // 属性字符串
    attrStr = content.slice(firstSpaceIdx + 1)
  }

  const attrs = attrStr ? attrStr.split(' ') : []
  const attrMap = parseAttrs(attrs)
  // 生成 AST
  const elementAst = generateAST(tagName, attrMap)
}

/**
 * 解析属性数组，得到 key、value 数组对象
 */
function parseAttrs(attrs) {
  const attrMap = {}
  for (const attr of attrs) {
    // attr = "id='app'"
    const { attrName, attrValue } = attr.split('=')
    attrMap[attrName] = attrValue
  }
  return attrMap
}

/**
 * 生成 AST 对象
*/
function generateAST(tag, attrMap){
  return {
    // 元素节点
    type: 1,
    // 标签名
    tag,
    // 元素属性对象
    rawAttr: attrMap
  }
}

// 处理闭合标签
function parseEnd() {}
