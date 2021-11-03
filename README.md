## 手写 Vue2.x

基于 1.x 版本实现 Vue2 的核心原理：包括如下功能

- 基于模版解析的编译器

  - 解析模版得到 AST
  - 基于 AST 生成渲染函数
  - render helper
    - \_c，创建指定标签的 VNode
    - \_v，创建文本节点的 VNode
    - \_t，创建插槽节点的 VNode
  - VNode

- patch

  - 原生标签和组件的初始渲染
    - v-model
    - v-bind
    - v-on
    - diff

- 插槽原理

- computed

- 异步更新队列


挂载 -> 实例化渲染 Watcher -> 执行 updateComponent 方法 -> 执行 render 函数生成 VNode -> 执行 patch 进行首次渲染 -> 递归遍历 VNode 创建各个节点并处理节点上的普通属性和指令 -> 如果节点是自定义组件则创建组件实例 -> 进行组件的初始化、挂载 -> 最终所有 VNode 变成真实的 DOM 节点并替换掉页面上的模版内容 -> 完成初始渲染


响应式数据发生更新 -> setter 拦截到更新操作 -> dep 通知 watcher 执行 update 方法 -> 进而执行 updateComponent 方法更新组件 -> 执行 render 生成新的 vnode -> 将 vnode 传递给 vm._update 方法 -> 调用 patch 方法 -> 执行 patchVnode 进行 DOM diff 操作 -> 完成更新

