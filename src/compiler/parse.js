import isUnaryTag from '../utils.js'

export default function parse(template) {
  // 最终返回的 ast
  let root = null
  // 备份
  let html = template
  // 存放元素的 ast 对象
  const stack = []

  // 遍历 html 模板字符串
  while (html.trim()) {
    if (html.indexOf('<!--') === 0) {
      // 注释标签
      // 找到注释节点结束位置  <-- 注释标签 -->
      const endIndex = html.indexOf('-->')
      html = html.slice(endIndex + 3)
      continue
    }
    const startIdx = html.indexOf('<')
    if (startIdx === 0) {
      // 匹配到正常标签 <div id='app'></div>
      if (html.indexOf('</') === 0) {
        // 结束标签
        parseEnd()
      } else {
        // 开始标签
        parseStartTag()
      }
    } else if (startIdx > 0) {
      // 在标签之前有文本 <div id='app'>text</div>  如 text
      // 在 html 字符串中找到下一个标签的位置
      const nextStartIdx = html.indexOf('<')
      if (stack.length) {
        // stack 不为空，说明文本是栈顶元素的文本节点
        processChars(html.slice(0, nextStartIdx))
        // 将文本从 html 中截取掉
        html = html.slice(nextStartIdx)
      }
    } else {
      // 整个模板中没有标签信息，一段纯文本
    }
  }

  return root

  /**
   * 处理开始标签
   *  如： <div id='app'>xxx</div>、<h3>xxx</h3>
   */
  function parseStartTag() {
    // 匹配开始标签中的结束位置  <div id='app'>
    const endIdx = html.indexOf('>')
    // 获取开始标签内的所有内容   div id='app'
    const content = html.slice(1, endIdx)
    // 更新 html，将 content 从 html 上截取掉
    html = html.slice(endIdx + 1)
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
    if (!root) {
      // 最开始的第一个标签
      root = elementAst
    }
    // 将 ast 对象 push 到栈中，当遇到他的 结束标签时，将栈顶的 ast 对象 pop 出来
    stack.push(elementAst)

    // 自闭合标签 <input type='text' />
    if (isUnaryTag(tagName)) {
      // 自闭合标签，直接进入闭合标签的处理流程
      processElement()
    }
  }

  /**
   * 解析属性数组，得到 key、value 数组对象
   */
  function parseAttrs(attrs) {
    const attrMap = {}
    for (const attr of attrs) {
      // attr = "id='app'"
      const [attrName, attrValue] = attr.split('=')
      attrMap[attrName] = attrValue
    }
    return attrMap
  }

  /**
   * 生成 AST 对象
   */
  function generateAST(tag, attrMap) {
    return {
      // 元素节点
      type: 1,
      // 标签名
      tag,
      // 原始属性对象
      rawAttr: attrMap,
      // 子节点
      children: [],
    }
  }

  /**
   * 处理闭合标签，如：</div>
   */
  function parseEnd() {
    // 将闭合标签从 html 字符串中截取
    html = html.slice(html.indexOf('>') + 1)
    // 进一步处理栈顶元素
    processElement()
  }

  /**
   * 处理元素的闭合标签时会被调用
   * 进一步处理元素上的各个属性，并且将处理结果放到 attr 属性上
   */
  function processElement() {
    // 处理栈顶元素
    const curEle = stack.pop()
    // 进一步处理 AST 对象中的 rawAttr 对象，将处理结果放到 attr 属性上
    const { rawAttr } = curEle
    curEle.attr = {}
    // 原始属性名组成的数组，如：[v-model, v-bind, ...]
    const propertyArr = Object.keys(rawAttr)
    if (propertyArr.includes('v-model')) {
      // 处理 v-model 指令
      processVModel(curEle)
    } else if (propertyArr.find(item => item.match(/v-bind:(.*)/))) {
      // 处理 v-bind 指令
      processVBind(curEle, RegExp.$1, rawAttr[`v-bind:${RegExp.$1}`])
    } else if (propertyArr.find(item => item.match(/v-on:(.*)/))) {
      // 处理 v-on 指令
      processVOn(curEle, RegExp.$1, rawAttr[`v-on:${RegExp.$1}`])
    } else {
      // 处理普通属性，暂不处理，直接放在 元素上
    }

    // 节点属性处理完之后，将其和父节点挂钩
    const stackLen = stack.length
    if (stackLen) {
      stack[stackLen - 1].children.push(curEle)
      curEle.parent = stack[stackLen - 1]
    }
  }

  /**
   * 处理 v-model 指令，将处理结果放到 curEle.attr 属性上
   * <input type='text' v-model='key' />
   * <input type='checkbox' v-model='input' />
   * <textarea v-model='textarea'></textarea>
   * <select v-model='selectValue'></select>
   */
  function processVModel(curEle) {
    const { attr, tag, rawAttr } = curEle
    const { type, 'v-model': vModelValue } = rawAttr

    if (tag === 'input') {
      if (/text/.test(type)) {
        // 文本输入框
        attr.vModel = { tag, type: 'text', value: vModelValue }
      } else if (/checkbox/.test(type)) {
        // checkbox
        attr.vModel = { tag, type: 'checkbox', value: vModelValue }
      }
    } else if (tag === 'textarea') {
      attr.vModel = { tag, value: vModelValue }
    } else if (tag === 'select') {
      attr.vModel = { tag, value: vModelValue }
    }
  }

  /**
   * 处理 v-bind 指令，将处理结果放到 curEle.attr 属性上
   * <span v-bind:title='value'></span>
   * @param {*} curEle: 当前节点
   * @param {*} bindKey: title
   * @param {*} bindValue: value
   */
  function processVBind(curEle, bindKey, bindValue) {
    curEle.attr.vBind = { [bindKey]: bindValue }
  }

  /**
   * 处理 v-on 指令，将处理结果放到 curEle.attr 属性上
   * <button v-on:click='add'>add</button>
   */
  function processVOn(curEle, vOnKey, vOnValue) {
    curEle.attr.vOn = { [vOnKey]: vOnValue }
  }

  /**
   * 处理文本
   */
  function processChars(text) {
    // 空文本
    if (!text.trim()) return
    // 构造文本节点的 AST 对象
    const textAst = {
      type: 3,
      text,
    }

    // 处理动态文本 {{ text }}
    if (text.match(/{{(.*)}}/)) {
      //  ["{{ text }}", " text ", index: 6, input: "<span>{{ text }}</span>", groups: undefined]
      // text
      textAst.expression = RegExp.$1.trim()
    }
    // 文本节点放到栈顶元素的 children 里面
    stack[stack.length - 1].children.push(textAst)
  }
}
