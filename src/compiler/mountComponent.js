import Vue from '../index.js'
import Watcher from '../watcher.js'

export default function mountComponent(vm) {
  // 负责初始渲染和后续更新组件
  const updateComponent = () => {
    vm._update(vm._render())
  }
  // 实例化一个渲染 Watcher，响应式数据更新时，更新函数被执行
  new Watcher(updateComponent)
}

/**
 * 负责执行 vm.$options.render 函数
 */
Vue.prototype._render = function () {
  // 给 render 函数绑定 this 上下文为 Vue 实例
  return this.$options.render.apply(this)
}

/**
 * @param {*} vnode 由 render 函数生成的 VNode （虚拟 DOM）
 */
Vue.prototype._update = function (vnode) {
  // 获取旧的 vnode 节点
  const prevVNode = this._vnode
  // 设置新的 vnode
  this._vnode = vnode
  if (!prevVNode) {
    // 老的 vnode 不存在，说明是首次渲染
    this.$el = this.__patch__(this.$el, vnode)
  } else {
    // 老的 vnode 存在，说明后续更新
    this.$el = this.__patch__(prevVNode, vnode)
  }
}
