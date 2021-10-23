export default function Proxy(target, sourceKey, key) {
  Object.defineProperty(target, key, {
    get() {
      return target[sourceKey][key]
    },
    set(newVal){
        target[sourceKey][key] = newVal
    }
  })
}
