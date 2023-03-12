import { isObject } from '@vue/shared'
import { mutableHandlers, readonlyHandlers } from './baseHandlers'

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly'
}
export interface Target {
  [ReactiveFlags.IS_REACTIVE]?: boolean
  [ReactiveFlags.IS_READONLY]?: boolean
}

// 存放代理过的对象
export const reactiveMap = new WeakMap<Target, any>()
export const readonlyMap = new WeakMap<Target, any>()

export function reactive(target: any) {
  if (isReadonly(target)) {
    return target
  }
  return createReactiveObject(target, mutableHandlers, reactiveMap)
}

export function readonly(target: any) {
  return createReactiveObject(target, readonlyHandlers, readonlyMap)
}

function createReactiveObject(
  target: Target,
  baseHandlers: ProxyHandler<any>,
  proxyMap: WeakMap<Target, any>
) {
  // 如果传入的不是一个对象 Proxy用于创建一个对象的代理
  if (!isObject) {
    console.warn('响应式元素必须是一个对象！')
    return target
  }
  // 目标已经有相应的代理 直接返回被代理过的对象
  const existingProxy = proxyMap.get(target)
  if (existingProxy) {
    return existingProxy
  }
  // 如果传的是proxy
  // 第一次传入的普通对象 还没有走get时候访问是false
  if (target[ReactiveFlags.IS_REACTIVE]) {
    return target
  }
  const proxy = new Proxy(target, baseHandlers)
  // 存储proxy
  proxyMap.set(target, proxy)
  return proxy
}

// 是否是一个 reactive
export function isReactive(value: unknown): boolean {
  return !!(value && (value as Target)[ReactiveFlags.IS_REACTIVE])
}
// 是否是一个 readonly
export function isReadonly(value: unknown): boolean {
  return !!(value && (value as Target)[ReactiveFlags.IS_READONLY])
}
