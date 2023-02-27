import { describe } from 'vitest'
import { effect } from '../src/effect'
import { reactive } from '../src/reactive'
describe('effect', () => {
  it('happy path', () => {
    const userState = reactive({
      name: 'mz',
      age: 18
    })
    let nextAge
    effect(() => {
      nextAge = userState.age + 1
    })
    expect(nextAge).toBe(19)

    userState.age = 24

    expect(nextAge).toBe(25)
  })
})
