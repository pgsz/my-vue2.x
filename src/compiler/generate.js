/**
 * 从 AST 对象生成渲染函数
 */
export default function generate(el) {
  // console.log(el)
  const renderStr = genElement(el)
  // console.log(renderStr)
  // 通过 new Function 将字符串形式的函数转换成可执行函数，并用 with 为渲染函数扩展作用域链
  return new Function(`with(this) { return ${renderStr} }`)
}

/**
 * 最终返回格式： _c(tag, attr, children)
 */
function genElement(el) {
  const { tag, rawAttr, attr } = el
  // 合并处理
  const attrs = { ...rawAttr, ...attr }
  const children = genChildren(el)
  if (tag === 'slot') {
    // 生成插槽的处理函数
    return `_t(${JSON.stringify(attrs)}, [${children}])`
  }
  return `_c('${tag}', ${JSON.stringify(attrs)}, [${children}])`
}

/**
 * 处理 AST 节点的子节点，将子节点变成渲染函数
 */
function genChildren(el) {
  const ret = []
  const { children } = el
  for (let i = 0, len = children.length; i < len; i++) {
    const child = children[i]
    if (child.type === 3) {
      // 文本节点
      ret.push(`_v(${JSON.stringify(child)})`)
    } else if (child.type === 1) {
      // 元素节点 递归处理
      ret.push(genElement(child))
    }
  }
  return ret
}
