import { describe } from 'vitest'
import { effect, stop } from '../src/effect'
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

  // 1. effect 返回一个runner 函数
  // 2. 可再次调用effect
  // 3. 返回值为 传入effect 中 fn的返回值
  it('return runner', () => {
    let age = 18
    const runner = effect(() => {
      age++
      return 'mz'
    })
    expect(age).toBe(19)
    const r = runner()
    expect(r).toBe('mz')
    expect(age).toBe(20)
  })

  // 1. 给effect 第二个参数传递一个 scheduler 的 fn
  // 2. effect 初次执行还会执行fn
  // 3. 当依赖 update时，会执行 scheduler
  // 4. 当执行runner 时 会再次执行fn
  it('scheduler', () => {
    let dummy
    let run: any
    const scheduler = vi.fn(() => {
      run = runner
    })
    const obj = reactive({ foo: 1 })
    const runner = effect(
      () => {
        dummy = obj.foo
      },
      { scheduler }
    )
    expect(scheduler).not.toHaveBeenCalled()
    expect(dummy).toBe(1)
    // should be called on first trigger
    obj.foo++
    expect(scheduler).toHaveBeenCalledTimes(1)
    // should not run yet
    expect(dummy).toBe(1)
    // manually run
    run()
    // should have run
    expect(dummy).toBe(2)
  })

  // 调用stop 不再更新
  // effect => active = true && run()
  // 调用stop active = false 不再执行run(传入effect的fn)
  it('stop', () => {
    let dummy
    const obj = reactive({ prop: 1 })
    const runner = effect(() => {
      dummy = obj.prop
    })
    obj.prop = 2
    expect(dummy).toBe(2)
    stop(runner)
    obj.prop = 3
    expect(dummy).toBe(2)

    // stopped effect should still be manually callable
    runner()
    expect(dummy).toBe(3)
  })

  // 1. 给effect 第二个参数传递一个 onStop 的 fn
  // 2. 调用stop 时 会调用 onstop
  it('events: onStop', () => {
    const onStop = vi.fn()
    const runner = effect(() => undefined, {
      onStop
    })
    stop(runner)
    expect(onStop).toHaveBeenCalled()
  })
})
