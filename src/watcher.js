import queueWatcher from './asyncUpdateQueue.js'
import { popTarget, pushTarget } from './dep.js'

// 表示 watcher 的 id，用来排序
let uid = 0

// cb：负责更新 DOM 节点的方法
export default function Watcher(cb, options = {}, vm = null) {
  this.uid = uid++
  this._cb = cb
  // 配置项
  this.options = options
  // 如果是非懒执行，则直接执行 cb 函数，cb 函数执行的时候会发生 vm.xx 的属性读取行为，从而触发收集依赖
  !options.lazy && this.get()
  // 记录 Vue 实例
  this.vm = vm
  // dirty，计算属性实现缓存的本质，只有 dirty 为 true，才会执行一次计算属性的回调函数
  this.dirty = true
  // watcher 中 cb 的执行结果
  this.value = null
}

/**
 * 负责执行 Watcher 的 cb 函数
 * 执行时进行依赖收集
 */
Watcher.prototype.get = function () {
  // 赋值 Dep.target，进行依赖收集
  pushTarget(this)
  this.value = this._cb.apply(this.vm)
  // 重置 Dep.target，防止重复的依赖收集
  popTarget()
}

/**
 * 响应式数据更新时，dep 通知 watcher 执行 update 方法
 * 让 update 方法执行 this._cb 函数，进而更新 DOM
 */
Watcher.prototype.update = function () {
  if (this.options.lazy) {
    // 懒执行
    this.dirty = true
  } else {
    // 将 watcher 自己放到 watcher 队列
    queueWatcher(this)
  }
  // // 当响应式数据更新时，执行 this._cb 函数，更新 DOM
  // Promise.resolve().then(() => {
  //   this._cb()
  // })
  // // 将 dirty 置为 true，当组件更新时，重新执行 updateComponent 方法
  // // 进而执行 render 函数，生成组件的新的 vnode，patch更新阶段，将 vnode 变成真实的 DOM 节点
  // // 发生 this.xxx 属性读取操作，从而触发 get，此时 watcher.dirty 为 true，所以重新执行 evalute 方法
  // // 进而执行 computed 属性的回调函数，计算新的值
  // // 执行结束之后，将 dirty 置为 false，本次刷新周期内就不会重复执行
  // this.dirty = true
}

/**
 * 由刷新 watcher 队列的函数调用，负责执行 watcher.get 方法
*/
Watcher.prototype.run = function () {
  this.get()
}

Watcher.prototype.evalute = function () {
  // 执行 get，触发计算函数（cb）的执行
  // debugger
  this.get()
  // 将 dirty 置为 false，实现一次刷新周期内 computed 计算属性只执行一次，从而实现缓存效果
  this.dirty = false
}
