export const mutableHandlers: ProxyHandler<object> = {
  get(target, key, receiver) {
    // 收集依赖
    return Reflect.get(target, key, receiver)
  },
  set(target, key, value) {
    // 触发依赖
    const result = Reflect.set(target, key, value)
    return result
  }
}
