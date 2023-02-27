import { track, trigger } from './effect'

export const mutableHandlers: ProxyHandler<object> = {
  get(target, key, receiver) {
    // 收集依赖
    track(target, key)
    return Reflect.get(target, key, receiver)
  },
  set(target, key, value) {
    const result = Reflect.set(target, key, value)
    // 触发依赖
    trigger(target, key)
    return result
  }
}
