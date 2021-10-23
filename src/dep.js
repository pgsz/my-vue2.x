export default function Dep() {
  this.watchers = []
}

// 实例化 Watcher 时 赋值 Dep.target = Watcher 实例
Dep.target = null

// 依赖收集
Dep.prototype.depend = function () {
  this.watchers.push(Dep.target)
}

// 依赖通知
Dep.prototype.notify = function () {
  for (const watcher of this.watchers) {
    watcher.update()
  }
}
