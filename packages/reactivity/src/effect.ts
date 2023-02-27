import { isFunction, isArray } from '@vue/shared'
import { createDep, Dep } from './dep'

let activeEffect: ReactiveEffect | undefined

/**
 * 依赖收集
 */
export class ReactiveEffect<T = any> {
  constructor(public fn: () => T) {
    activeEffect = this as ReactiveEffect
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
export function effect<T = any>(fn: () => T) {
  if (!isFunction) console.warn('effect 传入必须是一个函数！')
  const _effect = new ReactiveEffect(fn)
  _effect.run()
}

// 存放依赖收集数据 {target -> key -> dep}
const targetMap = new WeakMap<any, Map<any, Dep>>()

/**
 * 依赖收集
 * @param target object 收集目标
 * @param key unknown 目标元素
 */
export function track(target: object, key: unknown) {
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = createDep()))
  }
  trackEffects(dep)
}

/**
 * 存放所有的 effect
 * @param dep Dep
 */
export function trackEffects(dep: Dep) {
  // 是否需要存放dep
  // 存放过的不需要追加
  let shouldTrack = false
  shouldTrack = !dep.has(activeEffect!)
  if (shouldTrack) {
    dep.add(activeEffect!)
  }
}

/**
 * 触发依赖
 * @param target
 * @param key
 */
export function trigger(target: object, key: unknown) {
  const depsMap = targetMap.get(target)
  // 看有没有没追踪过 没有直接不做操作
  if (!depsMap) return
  // 创建dep集合deps
  const deps: (Dep | undefined)[] = []
  const dep = depsMap.get(key)
  deps.push(dep)

  if (deps.length === 1) {
    deps[0] && triggerEffects(deps[0])
  } else {
    const effects: ReactiveEffect[] = []
    for (const dep of deps) {
      dep && effects.push(...dep)
    }
    triggerEffects(createDep(effects))
  }
}

export function triggerEffects(dep: Dep | ReactiveEffect[]) {
  const effects = isArray(dep) ? dep : [...dep]
  for (const effect of effects) {
    triggerEffect(effect)
  }
}

/**
 * 重新执行effect
 * @param effect
 */
function triggerEffect(effect: ReactiveEffect) {
  effect.run()
}
