import Observer from './Observer.js'

export default function observe(value) {
  if (typeof value !== 'object') return
  // value 已经是响应式对象，不需要做响应式处理
  if (value.__ob__) return value.__ob__
  const ob = new Observer(value)
  return ob
}
