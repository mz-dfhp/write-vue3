import { track, trigger } from './effect'
import { TrackOpTypes, TriggerOpTypes } from './operations'
import { ReactiveFlags } from './reactive'

// 为什么用 Reflect
// 当 获取age 时要收集name name变化了 age也要重新计算
// 如果在原始对象取age 是不会对name 进行依赖收集
// const user = {
//   name: 'mz',
//   get age() {
//     return this.name
//   }
// }

export const mutableHandlers: ProxyHandler<object> = {
  get(target, key, receiver) {
    // 控制 已经被代理过的对象 flag
    if (key === ReactiveFlags.IS_REACTIVE) return true
    // 收集依赖
    track(target, TrackOpTypes.GET, key)
    return Reflect.get(target, key, receiver)
  },
  set(target, key, value) {
    const oldValue = (target as any)[key]
    const result = Reflect.set(target, key, value)
    // 如果新值等于旧值 则不需要更新
    if (oldValue !== value) {
      // 触发依赖
      trigger(target, TriggerOpTypes.SET, key)
    }
    return result
  }
}
