import Vue from '../index.js'
import { isReserveTag } from '../utils.js'

/**
 * 负责初始化渲染和后续更新
 */
export default function patch(oldVnode, vnode) {
  // console.log(oldVnode)
  // console.log(vnode)
  if (oldVnode && !vnode) {
    // 老的存在，新的不存在 --- 销毁组件
    return
  }
  if (!oldVnode) {
    // 子组件首次渲染
    createElm(vnode)
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
      patchVnode(oldVnode, vnode)
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

/**
 * 创建自定义组件
 */
function createComponent(vnode) {
  if (vnode.tag && !isReserveTag(vnode.tag)) {
    // 获取组件的基本配置信息
    const {
      tag,
      context: {
        $options: { components },
      },
    } = vnode
    const compOptions = components[tag]
    // 实例化子组件
    const compIns = new Vue(compOptions)
    // 把父组件的 vnode 放入 子组件的实例上
    compIns._parentVnode = vnode
    // 手动执行挂载
    compIns.$mount()
    // 记录子组件 vnode 的父节点信息
    // compIns._vnode.parent = vnode.parent
    // 将子组件添加到父节点内
    vnode.parent.appendChild(compIns._vnode.elm)
    return true
  }
}

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

/**
 * 给节点设置属性
 */
function setAttribute(attr, vnode) {
  // 遍历属性对象：普通属性，直接设置；指令，特殊处理
  for (const name in attr) {
    if (name === 'vModel') {
      setVModel(vnode.tag, attr.vModel.value, vnode)
    } else if (name === 'vBind') {
      setVBind(vnode)
    } else if (name === 'vOn') {
      setVOn(vnode)
    } else {
      // 普通属性
      vnode.elm.setAttribute(name, attr[name])
    }
  }
}

/**
 * v-model 原理
 * @param {*} tag 标签名
 * @param {*} value  属性值
 * @param {*} vnode  节点
 */
function setVModel(tag, value, vnode) {
  const { context: vm, elm } = vnode
  if (tag === 'select') {
    // 延迟设置， option 元素还没创建
    Promise.resolve().then(() => {
      elm.value = vm[value]
    })
    elm.addEventListener('change', function () {
      vm[value] = elm.value
    })
  } else if (tag === 'input' && vnode.elm.type === 'text') {
    // <input type="input" v-model="test" />
    elm.value = vm[value]
    elm.addEventListener('input', function () {
      vm[value] = elm.value
    })
  } else if (tag === 'input' && vnode.elm.type === 'checkbox') {
    // <input type="checkbox" v-model="test" />
    elm.checked = vm[value]
    elm.addEventListener('change', function () {
      vm[value] = elm.checked
    })
  }
  elm.removeAttribute(`v-model`)
}

/**
 * v-bind 指令原理
 * <span v-bind:title='test'></span>
 */
function setVBind(vnode) {
  const {
    attr: { vBind },
    elm,
    context: vm,
  } = vnode
  for (const attrName in vBind) {
    elm.setAttribute(attrName, vm[vBind[attrName]])
    elm.removeAttribute(`v-bind:${attrName}`)
  }
}

/**
 * v-on 指令原理
 */
function setVOn(vnode) {
  const {
    attr: { vOn },
    elm,
    context: vm,
  } = vnode
  for (const eventName in vOn) {
    elm.addEventListener(eventName, function (...args) {
      vm.$options.methods[vOn[eventName]].apply(vm, args)
    })
    elm.removeAttribute(`v-on:${eventName}`)
  }
}

/**
 * 对比新老节点（oldVnode 和 vnode），找出不同，并更新老节点
 */
function patchVnode(oldVnode, vnode) {
  // 新老节点相同
  if (oldVnode === vnode) return

  // 将老 vnode 上的真实节点同步到新的 vnode 上，避免后续更新的时候出现 vnode.elm 为空
  vnode.elm = oldVnode.elm

  // 新老节点的子节点
  const ch = vnode.children
  const oldCh = oldVnode.children

  if (!vnode.text) {
    // 新节点不存在文本节点
    if (ch && oldCh) {
      // 新老节点都有子节点
      updateChildren(ch, oldCh)
    } else if (ch) {
      // 老节点没有，新节点有，则新增
    } else if (oldCh) {
      // 老节点有，新节点无，则删除老节点的子节点
    }
  } else {
    // 新节点存在文本节点
    if (vnode.text.expression) {
      // 存在表达式
      // 获取表达式的新值
      const value = JSON.stringify(vnode.context[vnode.text.expression])
      try {
        const oldValue = oldVnode.elm.textContent
        if (value !== oldValue) {
          oldVnode.elm.textContent = value
        }
      } catch {
        // 防止更新时遇到插槽，导致报错
      }
    }
  }
}

/**
 * diff 对比子节点，找出不同点，然后将不同点更新到老节点上
 * 具体的更新由 patchVnode 完成，涉及递归
 */
function updateChildren(ch, oldCh) {
  // 四个游标
  // 新前索引
  let newStartIdx = 0
  // 新后
  let newEndIdx = ch.length - 1
  // 老前
  let oldStartIdx = 0
  // 老后
  let oldEndIdx = oldCh.length - 1

  // 遍历 循环遍历新老节点，找出不一样的地方，然后更新
  // 四种假设，降低时间复杂度
  while (newStartIdx <= newEndIdx || oldStartIdx <= oldEndIdx) {
    // 新前节点
    const newStartNode = ch[newStartIdx]
    const newEndNode = ch[newEndIdx]
    const oldStartNode = oldCh[oldStartIdx]
    const oldEndNode = oldCh[oldEndIdx]

    if (sameVnode(newStartNode, oldStartNode)) {
      // 新前 和 老前
      patchVnode(oldStartNode, newStartNode)
      oldStartIdx++
      newStartIdx++
    } else if (sameVnode(newStartNode, oldEndNode)) {
      // 新前 和 老后
      patchVnode(oldEndNode, newStartNode)
      // 将老节点移动到新开始的位置
      oldEndNode.elm.parentNode.insertBefore(oldEndNode.elm, oldCh[newStartIdx].elm)
      oldEndIdx--
      newStartIdx++
    } else if ((newEndNode, oldStartNode)) {
      // 新后 和 老前
      patchVnode(oldStartNode, newEndNode)
      // 将老开始节点移动到新结束位置
      oldEndNode.elm.parentNode.insertBefore(oldStartNode.elm, oldCh[newEndIdx].elm.nextSibling)
      oldStartIdx++
      newEndIdx--
    } else if ((newEndNode, oldEndNode)) {
      // 新后 和 老后
      patchVnode(oldEndNode, newEndNode)
      oldEndIdx--
      newEndIdx--
    } else {
      // 都没命中，则遍历找出新老 vnode 的相同节点
    }
  }

  // 跳出循环，说明某个节点已经遍历结束
  if (newStartIdx < newEndIdx) {
    // 老节点先遍历结束，需要将剩余新节点添加到 DOM 中
  } else if (oldStartIdx < oldEndIdx) {
    // 新节点先遍历结束，将剩余的老节点删除
  }
}

/**
 * 判断两个节点是否是同一个节点
 */
function sameVnode(a, b) {
  // 简单判断，只比较 key 和 tag
  return a.key === b.key && a.tag === b.tag
}
