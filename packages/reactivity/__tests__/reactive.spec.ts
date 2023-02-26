import { describe } from 'vitest'
import { reactive } from '../src/reactive'
describe('reactive', () => {
  it('happy path', () => {
    const user = { name: 'mz' }
    const userState = reactive(user)
    expect(user).not.toBe(userState)
    expect(userState.name).toBe('mz')
  })
})
