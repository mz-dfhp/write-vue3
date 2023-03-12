import { describe } from 'vitest'
import { readonly, isReadonly } from '../src/reactive'
describe('readonly', () => {
  it('happy path', () => {
    const user = { name: 'mz' }
    const userState = readonly(user)
    // 代理过的不等于原始对象
    expect(user).not.toBe(userState)
    // 访问代理对象的值
    expect(userState.name).toBe('mz')
  })

  // 原始对象被多次代理 则使用缓存
  it('happy path', () => {
    const user = { name: 'mz' }
    const user1 = readonly(user)
    const user2 = readonly(user)
    expect(user2).toBe(user1)
  })

  // 代理一个被代理的对象 则直接返回
  it('happy path', () => {
    const user = { name: 'mz' }
    const user1 = readonly(user)
    const user2 = readonly(user1)
    expect(user).not.toBe(user1)
    expect(user1).toEqual(user2)
  })

  // readonly
  // 1. 只读 不会track收集依赖 trigger触发依赖更新
  // 2. 设置值时会警告
  it('happy path', () => {
    console.warn = vi.fn()
    const user = readonly({ name: 'mz', age: 18 })
    user.age++
    expect(isReadonly(user)).toBe(true)
    expect(user.age).toBe(18)
    expect(console.warn).toBeCalled()
  })
})
