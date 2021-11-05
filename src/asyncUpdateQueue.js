// 存放所有的 watcher 实例
const queue = []
// 标识当前的 watcher 队列是否正在被刷新
let flushing = false
// 表示 callbacks 数组中是否已经存在一个刷新 watcher 队列的函数
let waiting = false
// 标识当前浏览器任务队列中是否已经存在刷新 callbacks 数组的函数
let pending = false
// 存放刷新 watcher 队列的函数，或者用户调用 Vue.nextTick 方法时传递的回调函数
const callbacks = []

export default function queueWatcher(watcher) {
  if (!queue.includes(watcher)) {
    // 防止 watcher 重复入队
    if (!flushing) {
      // 说明 watcher 队列没有在刷新，直接入队
      queue.push(watcher)
    } else {
      // 当前 watcher 队列正在被刷新
      // 当 watcher 回调函数存在更改响应式数据的情况时，此情况下会存在刷新 watcher 队列时进来新的 watcher
      // 当刷新 watcher 队列时，队列是有序，所以需要将新插入的 watch 放到合适的位置，保证队列依然有序
      // 标识当前 watcher 是否在 for 循环入队
      let flag = false
      for (let i = queue.length - 1; i >= 0; i--) {
        if (queue[i].uid < watcher.uid) {
          // 找到比的当前 watcher.uid 小的 watcher
          // 需要将该 watcher 插入到找到元素的后面
          queue.splice(i + 1, 0, watcher)
          flag = true
          break
        }
      }
      if (!flag) {
        queue.unshift(watcher)
      }
    }

    if (!waiting) {
      // 保证 callbacks 数组中只有一个刷新 watcher 队列的函数
      waiting = true
      nextTick(flushSchedulerQueue)
    }
  }
}

/**
 * 负责刷新 watcher 队列的函数，由 flushCallbacks 函数调用
 */
function flushSchedulerQueue() {
  // 表示正则刷新 watcher 队列
  flushing = true
  // 给 watcher 排序，根据 watcher.uid 从小到大的顺序
  queue.sort((a, b) => a.uid - b.uid)
  // 遍历队列，依次执行其中每个 watcher 的 run 方法
  while (queue.length) {
    // 取出队首的 watcher
    const watcher = queue.shift()
    // 执行 run 方法
    watcher.run()
  }
  // watcher 队列已经为空
  flushing = waiting = false
}

function nextTick(cb) {
  callbacks.push(cb)
  if (!pending) {
    // 标识浏览器当前任务队列中没有刷新 callbacks 数组的函数
    pending = true
    // 将刷新 callbacks 数组的函数放到浏览的异步队列中
    Promise.resolve().then(flushCallbacks)
  }
}

/**
 * 负责刷新 callbacks 数组
 * 本质：执行 callbacks 数组中的每一个函数
 */
function flushCallbacks() {
  // 表示浏览器任务队列中的 flushCallbacks 函数已经被执行栈执行
  // 新的 flushCallbacks 可以进来
  pending = false
  while (callbacks.length) {
    // 取出第一个回调函数
    const cb = callbacks.shift()
    // 执行回调函数
    cb()
  }
}
