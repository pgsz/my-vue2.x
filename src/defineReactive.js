import Dep from './dep.js'
import observe from './observe.js'

export default function defineReactive(target, key, val) {
  const childOb = observe(val)

  const dep = new Dep()

  Object.defineProperty(target, key, {
    get() {
      if (Dep.target) {
        dep.depend()
        // 如果存在子 ob，则一起把子对象的依赖收集
        if (childOb) {
          childOb.dep.depend()
        }
      }
      // console.log('getter key = ', key)
      return val
    },
    set(newVal) {
      // console.log(`setter ${key} = ${val}`)
      if (newVal == val) return
      val = newVal
      //  对新值做响应式处理
      observe(val)
      dep.notify()
    },
  })
}
