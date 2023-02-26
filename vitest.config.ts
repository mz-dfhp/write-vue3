import { defineConfig } from 'vitest/config'
import { entries } from './scripts/aliases.js'

export default defineConfig({
  resolve: {
    alias: entries
  },
  test: {
    globals: true
  }
})
