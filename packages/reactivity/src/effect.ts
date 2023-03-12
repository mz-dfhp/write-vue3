import { isFunction, isArray, extend } from '@vue/shared'
import { createDep, Dep } from './dep'
import { TrackOpTypes, TriggerOpTypes } from './operations'

export type EffectScheduler = (...args: any[]) => any

export interface ReactiveEffectOptions {
  scheduler?: EffectScheduler
  onStop?: () => void
}
export interface ReactiveEffectRunner<T = any> {
  (): T
  effect: ReactiveEffect
}

// 当前正在执行的 effect 全局使用
let activeEffect: ReactiveEffect | undefined

/**
 * 依赖收集
 */
export class ReactiveEffect<T = any> {
  active = true // 默认激活状态
  deps: Dep[] = [] // 让 effect 记录dep
  parent: ReactiveEffect | undefined = undefined // 父 effect 默认null
  onStop?: () => void

  constructor(
    public fn: () => T,
    public scheduler: EffectScheduler | null = null
  ) {
    this.fn = fn
  }
  // 执行effect
  run() {
    // 如果是非激活状态 执行函数 不需要进行依赖收集
    if (!this.active) {
      return this.fn()
    }
    // 当组件多层级嵌套时 不会出现问题
    // vue2 使用的栈结构来处理的 前进后出
    // 第一层 effect 执行 parent => undefined activeEffect => 自己
    // 第二层 effect 执行 parent => activeEffect(父亲) activeEffect = 自己
    // 第二层 effect 执行完 activeEffect => parent(父亲) parent = undefined
    // 收集sex 时 activeEffect指向第一层

    // demo
    // effect(() => {    e1
    //   state.name      name=>e1
    //   effect(() => {  e2
    //     state.age     age=>e2
    //   })
    //   state.sex       sex=>e1
    // })
    try {
      this.parent = activeEffect
      activeEffect = this as ReactiveEffect
      // 分支切换 清除effect
      cleanupEffect(this)
      return this.fn()
    } finally {
      // 执行完
      activeEffect = this.parent
      this.parent = undefined
    }
  }
  stop() {
    if (this.active) {
      cleanupEffect(this)
      if (this.onStop) {
        this.onStop()
      }
      this.active = false
    }
  }
}

/**
 * 清除依赖收集
 * @param effect
 */
function cleanupEffect(effect: ReactiveEffect) {
  const { deps } = effect
  if (deps.length) {
    for (let i = 0; i < deps.length; i++) {
      // deps删除了effect targetMap中的 Set也删除了 利用循环引用 指向同一块地址
      deps[i].delete(effect)
    }
    deps.length = 0
  }
}

/**
 * 副作用函数 此函数依赖的数据变化了 会重新执行
 * effect可以嵌套写 组件是基于effect
 * @param fn Function
 */
export function effect<T = any>(
  fn: () => T,
  options?: ReactiveEffectOptions
): ReactiveEffectRunner {
  if (!isFunction) console.warn('effect 传入必须是一个函数！')
  const _effect = new ReactiveEffect(fn)

  if (options) {
    extend(_effect, options)
  }
  _effect.run()
  // runner
  // effect (fn) => runner  runner => fn
  const runner = _effect.run.bind(_effect) as ReactiveEffectRunner
  runner.effect = _effect
  return runner
}

export function stop(runner: any) {
  runner.effect.stop()
}

// 存放依赖收集数据 {target -> key -> dep}
// 一个effect => 多个属性  一个属性 => effect
const targetMap = new WeakMap<any, Map<any, Dep>>()

/**
 * 依赖收集
 * @param target object 收集目标
 * @param key unknown 目标元素
 */
export function track(target: object, type: TrackOpTypes, key: unknown) {
  // 没有在 effect中取值 不收集
  if (!activeEffect) return
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
  // dep 是否 需要存放 effect 去重
  // 存放过的不需要追加 去重了
  let shouldTrack = false
  shouldTrack = !dep.has(activeEffect!)
  if (shouldTrack) {
    dep.add(activeEffect!)
    // 双向存储
    activeEffect!.deps.push(dep)
  }
}

/**
 * 触发依赖
 * @param target
 * @param key
 */
export function trigger(target: object, type: TriggerOpTypes, key: unknown) {
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
  // 防止在effect 放入自己 造成死循环
  // effect(() => {
  //   state.age = Math.random()
  // })
  if (effect !== activeEffect) {
    if (effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  }
}
