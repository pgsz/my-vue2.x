import defineReactive from './defineReactive.js'
import Dep from './dep.js'
import protoAugment from './protoArray.js'
import observe from './observe.js'

export default function Observer(value) {
  Object.defineProperty(value, '__ob__', {
    value: this,
    // 防止递归的时候处理 __ob__ 从而无限递归
    // 在页面显示的时候，不想显示 __ob__ 属性
    enumerable: false,
    writable: true,
    configurable: true,
  })

  value.__ob__.dep = new Dep()

  if (Array.isArray(value)) {
    // 数组响应式
    protoAugment(value)
    this.observeArray(value)
  } else {
    // 对象响应式
    this.walk(value)
  }
}

Observer.prototype.walk = function (obj) {
  for (let key in obj) {
    defineReactive(obj, key, obj[key])
  }
}

// 处理数组中元素为非原始值的情况，使其也具有响应式能力
Observer.prototype.observeArray = function (arr) {
  for (const item of arr) {
    observe(item)
  }
}
