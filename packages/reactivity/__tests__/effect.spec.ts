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

  it('runner', function () {
    const userState = reactive({
      name: 'mz',
      age: 18
    })
    let nextAge
    const runner = effect(() => {
      nextAge = userState.age + 1
      return 'age'
    })
    expect(nextAge).toBe(19)
    const r = runner()
    userState.age = 24
    expect(nextAge).toBe(25)
    expect(r).toBe('age')
  })
})
