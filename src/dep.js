export default function Dep() {
  this.watchers = []
}

// 实例化 Watcher 时 赋值 Dep.target = Watcher 实例
Dep.target = null

/**
 * 存储所有的 Dep.target
 * 为什么会有多个 Dep.target
 * 组件会产生一个渲染 Watcher，在渲染的过程中如果处理到用户 Watcher
 * 比如 computed 计算属性，这时候会执行 evalute -> get
 * 假如直接赋值 Dep.target，那 Dep.target 的上一个值 ---- 渲染 Watcher 就会丢失
 * 造成在 computed 计算属性之后渲染的响应式数据无法完成依赖收集
*/
const targetStack = []

// 依赖收集
Dep.prototype.depend = function () {
  // 防止 Watcher 被重复收集
  if (this.watchers.includes(Dep.target)) return
  // 收集 watcher 实例
  this.watchers.push(Dep.target)
}

// 依赖通知
Dep.prototype.notify = function () {
  for (const watcher of this.watchers) {
    watcher.update()
  }
}

/**
 * 备份本次传递进来的 Watcher，并将其赋值给 Dep.target
*/
export function pushTarget(target) {
  targetStack.push(target)
  Dep.target = target
}

/**
 * 将 Dep.target 重置为上一个 Watcher 或者 null
*/
export function popTarget() {
  targetStack.pop()
  Dep.target = targetStack[targetStack.length - 1]
}
