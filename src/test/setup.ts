import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Auto-cleanup after each test
afterEach(() => {
  cleanup()
  localStorage.clear()
  sessionStorage.clear()
})

// Mock crypto.randomUUID if not available
if (!global.crypto) {
  global.crypto = {
    randomUUID: () => vi.fn(() => Math.random().toString(36))(),
  } as Crypto
}

// Mock IndexedDB for testing environment
if (typeof indexedDB === 'undefined') {
  global.indexedDB = {
    open: vi.fn(() => ({
      result: null,
      error: null,
      onsuccess: null,
      onerror: null,
      onupgradeneeded: null,
    })),
  } as IDBFactory
}
