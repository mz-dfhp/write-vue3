import { isObject } from '@vue/shared'
import { mutableHandlers } from './baseHandlers'

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive'
}
export interface Target {
  [ReactiveFlags.IS_REACTIVE]?: boolean
}

// 存放代理过的对象
export const reactiveMap = new WeakMap<Target, any>()

/**
 * 将对象变为响应式 proxy
 * @param target
 * @returns
 */
export function reactive(target: any) {
  return createReactiveObject(target)
}

function createReactiveObject(target: any) {
  // 如果传入的不是一个对象 Proxy用于创建一个对象的代理
  if (!isObject) {
    console.warn('响应式元素必须是一个对象！')
    return target
  }
  // 目标已经有相应的代理 直接返回被代理过的对象
  const existingProxy = reactiveMap.get(target)
  if (existingProxy) {
    return existingProxy
  }
  // 如果传的是proxy
  // 第一次传入的普通对象 还没有走get时候访问是false
  if (target[ReactiveFlags.IS_REACTIVE]) {
    return target
  }
  const proxy = new Proxy(target, mutableHandlers)
  // 存储proxy
  reactiveMap.set(target, proxy)
  return proxy
}
