import Watcher from "./watcher.js"

/**
 * 初始化 computed 配置项
 * 为每个计算属性实例化 Watcher，并将计算属性代理到 Vue 上
 * 结合 watcher.dirty 和 watcher.evalute 实现 computed 缓存
 */
export default function initComputed(vm) {
  // 获取配置项
  const computed = vm.$options.computed
  // 记录 watcher
  const watcher = (vm._watcher = Object.create(null))
  // 遍历 computed 配置项
  for (const key in computed) {
    // 实例化 Watcher，回调函数默认懒执行
    watcher[key] = new Watcher(computed[key], { lazy: true }, vm)
    // 将 computed 属性 key 代理到 vue 实例上
    defineComputed(vm, key)
  }
}

/**
 * 将计算属性代理到 Vue 实例上，结合 watcher 实现 computed 属性的缓存
 */
function defineComputed(vm, key) {
  const descriptor = {
    get: function () {
      const watcher = vm._watcher[key]
      if (watcher.dirty) {
        // 说明当前 computed 回调函数在本次渲染周期内没有执行
        // 执行 evalute，通知 watcher 执行 computed 回调函数，得到回到函数的返回值
        watcher.evalute()
      }
      return watcher.value
    },
    set: function () {
      console.log('no setter')
    },
  }
  // 将计算属性代理到 Vue 实例上
  Object.defineProperty(vm, key, descriptor)
}
