export const isObject = (val: unknown): val is Record<any, any> =>
  typeof val !== null && typeof val === 'object'

export const isFunction = (fn: unknown) => typeof fn === 'function'

export const isArray = Array.isArray
