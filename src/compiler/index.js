import compileToFunction from './compileToFunction.js'
import mountComponent from './mountComponent.js'

export default function mount(vm) {
  // 编译
  if (!vm.$options.render) {
    // 获取模板
    let template = ''
    if (vm.$options.template) {
      // 存在 template 选项
      template = vm.$options.template
    } else if (vm.$options.el) {
      // <div id='app'></div>
      vm.$el = document.querySelector(vm.$options.el)
      template = vm.$el.outerHTML
    }

    // 生成渲染函数
    const render = compileToFunction(template)
    // console.log(render)

    vm.$options.render = render
  }
  // 挂载
  mountComponent(vm)
}
