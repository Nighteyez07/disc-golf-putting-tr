import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import {
  isHapticsSupported,
  getHapticPreference,
  setHapticPreference,
  triggerHaptic,
  haptics,
  VIBRATION_PATTERNS,
} from "./haptics"

describe("haptics", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    // Mock navigator.vibrate
    vi.stubGlobal("navigator", {
      vibrate: vi.fn(),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe("isHapticsSupported", () => {
    it("returns true when navigator.vibrate is available", () => {
      expect(isHapticsSupported()).toBe(true)
    })

    it("returns false when navigator.vibrate is not available", () => {
      vi.stubGlobal("navigator", {})
      expect(isHapticsSupported()).toBe(false)
    })

    it("returns false when navigator is undefined", () => {
      vi.stubGlobal("navigator", undefined)
      expect(isHapticsSupported()).toBe(false)
    })
  })

  describe("getHapticPreference", () => {
    it("returns true by default when not set", () => {
      expect(getHapticPreference()).toBe(true)
    })

    it("returns stored preference when set to true", () => {
      localStorage.setItem("haptic_feedback_enabled", "true")
      expect(getHapticPreference()).toBe(true)
    })

    it("returns stored preference when set to false", () => {
      localStorage.setItem("haptic_feedback_enabled", "false")
      expect(getHapticPreference()).toBe(false)
    })

    it("handles localStorage errors gracefully", () => {
      vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("Storage error")
      })
      expect(getHapticPreference()).toBe(true)
    })
  })

  describe("setHapticPreference", () => {
    it("saves preference to localStorage", () => {
      // Clear any previous spies
      vi.restoreAllMocks()
      
      setHapticPreference(false)
      expect(localStorage.getItem("haptic_feedback_enabled")).toBe("false")

      setHapticPreference(true)
      expect(localStorage.getItem("haptic_feedback_enabled")).toBe("true")
    })

    it("handles localStorage errors gracefully", () => {
      vi.restoreAllMocks()
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("Storage error")
      })
      expect(() => setHapticPreference(true)).not.toThrow()
      vi.restoreAllMocks()
    })
  })

  describe("triggerHaptic", () => {
    it("calls navigator.vibrate with pattern when supported and enabled", () => {
      const mockVibrate = vi.fn()
      vi.stubGlobal("navigator", { vibrate: mockVibrate })

      triggerHaptic([50])
      expect(mockVibrate).toHaveBeenCalledWith([50])
    })

    it("does not call navigator.vibrate when not supported", () => {
      vi.stubGlobal("navigator", {})
      const mockVibrate = vi.fn()
      
      triggerHaptic([50])
      expect(mockVibrate).not.toHaveBeenCalled()
    })

    it("does not call navigator.vibrate when disabled by user", () => {
      vi.restoreAllMocks()
      const mockVibrate = vi.fn()
      vi.stubGlobal("navigator", { vibrate: mockVibrate })
      setHapticPreference(false)

      triggerHaptic([50])
      expect(mockVibrate).not.toHaveBeenCalled()
    })

    it("handles vibrate errors gracefully", () => {
      const mockVibrate = vi.fn().mockImplementation(() => {
        throw new Error("Vibrate error")
      })
      vi.stubGlobal("navigator", { vibrate: mockVibrate })

      expect(() => triggerHaptic([50])).not.toThrow()
    })
  })

  describe("haptics convenience functions", () => {
    it("sink triggers correct pattern", () => {
      const mockVibrate = vi.fn()
      vi.stubGlobal("navigator", { vibrate: mockVibrate })

      haptics.sink()
      expect(mockVibrate).toHaveBeenCalledWith(VIBRATION_PATTERNS.SINK)
    })

    it("miss triggers correct pattern", () => {
      const mockVibrate = vi.fn()
      vi.stubGlobal("navigator", { vibrate: mockVibrate })

      haptics.miss()
      expect(mockVibrate).toHaveBeenCalledWith(VIBRATION_PATTERNS.MISS)
    })

    it("penalty triggers correct pattern", () => {
      const mockVibrate = vi.fn()
      vi.stubGlobal("navigator", { vibrate: mockVibrate })

      haptics.penalty()
      expect(mockVibrate).toHaveBeenCalledWith(VIBRATION_PATTERNS.PENALTY)
    })
  })

  describe("VIBRATION_PATTERNS", () => {
    it("has correct sink pattern", () => {
      expect(VIBRATION_PATTERNS.SINK).toEqual([50])
    })

    it("has correct miss pattern", () => {
      expect(VIBRATION_PATTERNS.MISS).toEqual([30, 30, 30])
    })

    it("has correct penalty pattern", () => {
      expect(VIBRATION_PATTERNS.PENALTY).toEqual([200, 100, 200])
    })
  })
})
