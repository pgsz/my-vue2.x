import VNode from './vnode.js'

/**
 * 负责运行时生成 VNode 的工具方法12345612345655
 */
export default function renderHelper(target) {
  target._c = createElement
  target._v = createTextNode
}

/**
 * 为指定标签创建虚拟 DOM
 */
function createElement(tag, attr, children) {
  return VNode(tag, attr, children, this)
}

/**
 * 创建文本节点的虚拟 DOM
*/
function createTextNode(textAst) {
  return VNode(null, null, null, this, textAst)
}
