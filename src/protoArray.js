// 数组响应式
const arrayProto = Array.prototype
const arrayMethods = Object.create(arrayProto)
const methodsToPatch = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse']

methodsToPatch.forEach(method => {
  Object.defineProperty(arrayMethods, method, {
    value: function (...args) {
      const ret = arrayProto[method].apply(this, args)
      console.log('array reactive')
      const ob = this.__ob__
      let inserted = []
      // 获取新增元素
      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args
          break
        case 'splice':
          inserted = args.slice(2)
          break
      }
      // 对新增元素响应式处理
      if (inserted) ob.observeArray(inserted)
      // 依赖通知更新
      ob.dep.notify()
      return ret
    },
    configurable: true,
    writable: true,
    enumerable: false,
  })
})

export default function protoAugment(arr) {
  arr.__proto__ = arrayMethods
}
