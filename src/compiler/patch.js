/**
 * 负责初始化渲染和后续更新
 */
export default function patch(oldVnode, vnode) {
  console.log(oldVnode)
  console.log(vnode)
  if (oldVnode && !vnode) {
    // 老的存在，新的不存在 --- 销毁组件
    return
  }
  if (!oldVnode) {
    // 子组件首次渲染
  } else {
    if (oldVnode.nodeType) {
      // 真实节点，则表示首次渲染根组件
      const parent = oldVnode.parentNode // 父节点
      // 参考标签时第一个 script 标签
      const referNode = oldVnode.nextSibling
      // 创建元素，将 vnode 变成真实节点，并添加到父节点
      createElm(vnode, parent, referNode)
      // 移除老的 vnode，模板节点
      parent.removeChild(oldVnode)
    } else {
      // 后续更新
      console.log('update')
    }
  }
}

/**
 * 创建元素
 * @param {*} vnode
 * @param {*} parent vnode 节点的父节点
 * @param {*} referNode 参考节点
 */
function createElm(vnode, parent, referNode) {
  // 在 vnode 上记录父节点
  vnode.parent = parent

  // 创建自定义组件，如果是非组件，继续后续流程
  if (createComponent(vnode)) return

  // 当前节点是元素标签，走 DOM API 创建标签，然后添加到父节点
  const { tag, attr, children, text } = vnode

  if (text) {
    // 文本节点 创建并插入到父节点
    vnode.elm = createTextVNode(vnode)
  } else {
    // 元素节点
    vnode.elm = document.createElement(tag)
    // 设置属性
    setAttribute(attr, vnode)
    // 循环递归调用 创建当前节点的所有子节点
    for (let i = 0, len = children.length; i < len; i++) {
      createElm(children[i], vnode.elm)
    }
  }
  // 节点创建完毕，将创建的节点插入到父节点
  if (parent) {
    const elm = vnode.elm
    if (referNode) {
      parent.insertBefore(elm, referNode)
    } else {
      parent.appendChild(elm)
    }
  }
}

function createComponent() {}

/**
 * 创建文本节点
 */
function createTextVNode(textVnode) {
  const { text } = textVnode
  let textNode = null
  if (text.expression) {
    // 当前文本节点有表达式
    // 表达式是响应式数据
    const value = textVnode.context[text.expression]
    textNode = document.createTextNode(typeof value === 'object' ? JSON.stringify(value) : value)
  } else {
    // 纯文本节点
    textNode = document.createTextNode(text.text)
  }
  return textNode
}

function setAttribute() {}
