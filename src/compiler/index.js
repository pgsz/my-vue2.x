import compileToFunction from './compileToFunction.js'

export default function mount(vm) {
  if (!vm.$options.render) {
    // 获取模板
    let template = ''
    if (vm.$options.template) {
      // 存在 template 选项
      template = vm.$options.template
    } else if (vm.$options.el) {
      // <div id='app'></div>
      template = document.querySelector(vm.$options.el).outerHTML
    }

    // 生成渲染函数
    const render = compileToFunction(template)

    vm.$options.render = render
  }
}
