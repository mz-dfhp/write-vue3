import { isObject } from '@vue/shared'

import { mutableHandlers } from './baseHandlers'

/**
 * 将对象变为响应式 proxy
 * @param target
 * @returns
 */
export function reactive(target: any) {
  return createReactiveObject(target)
}

function createReactiveObject(target: any) {
  if (!isObject) {
    console.warn('响应式元素必须是一个对象！')
    return target
  }
  const proxy = new Proxy(target, mutableHandlers)
  return proxy
}
