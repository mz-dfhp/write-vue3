import { test, expect } from 'vitest'
import { reactive } from '../src'
test('vitest-test', () => {
  expect(reactive({})).toBe(true)
  expect(reactive(1)).toBe(false)
})
