import { describe } from 'vitest'
import { reactive } from '../src/reactive'
describe('reactive', () => {
  it('happy path', () => {
    const user = { name: 'mz' }
    const userState = reactive(user)
    // 代理过的不等于原始对象
    expect(user).not.toBe(userState)
    // 访问代理对象的值
    expect(userState.name).toBe('mz')
  })

  // 原始对象被多次代理 则使用缓存
  it('happy path', () => {
    const user = { name: 'mz' }
    const user1 = reactive(user)
    const user2 = reactive(user)
    expect(user2).toBe(user1)
  })

  // 代理一个被代理的对象 则直接返回
  it('happy path', () => {
    const user = { name: 'mz' }
    const user1 = reactive(user)
    const user2 = reactive(user1)
    expect(user).not.toBe(user1)
    expect(user1).toBe(user2)
  })
})
