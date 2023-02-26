import { isFunction } from '@vue/shared'

class ReactiveEffect {
  fn: () => void
  constructor(fn: () => void) {
    this.fn = fn
  }
  run() {
    this.fn()
  }
}

/**
 * 副作用函数 此函数依赖的数据变化了 会重新执行
 * @param fn Function
 */
export function effect(fn: any) {
  if (!isFunction) console.warn('effect 传入必须是一个函数！')
  const _effect = new ReactiveEffect(fn)
  _effect.run()
}

const targetMap = new WeakMap()
/**
 * 依赖收集
 * @param target object 收集目标
 * @param key unknown 目标元素
 */
export function track(target: object, key: unknown) {
  // target > key > dep
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
}
