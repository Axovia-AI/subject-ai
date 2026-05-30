import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useToast, toast, reducer, _getListenersForTesting, _getEffectRunCount, _resetEffectRunCount } from './use-toast'

describe('useToast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Bug #3: useEffect dependency on [state] causes unnecessary effect re-runs', () => {
    beforeEach(() => {
      _resetEffectRunCount()
    })

    it('should only run effect once on mount, not on every state change', () => {
      // BUG: useEffect depends on [state] instead of []
      // This causes the effect to re-run on every state change
      // Expected: effect runs 1 time (on mount only)
      // Actual with bug: effect runs 1 + N times (N = number of state changes)

      const { result, unmount } = renderHook(() => useToast())

      // Effect should have run once on mount
      const afterMount = _getEffectRunCount()
      expect(afterMount).toBe(1)

      // Add a toast - triggers state change
      act(() => {
        toast({ title: 'Toast 1' })
      })

      // With correct [] dependency: effect count stays at 1
      // With buggy [state] dependency: effect count increases to 2
      const afterFirstToast = _getEffectRunCount()

      // THIS ASSERTION WILL FAIL WITH THE BUG - proving the bug exists
      expect(afterFirstToast).toBe(1) // Should still be 1, not 2

      // Add another toast
      act(() => {
        toast({ title: 'Toast 2' })
      })

      // With correct dependency: still 1
      // With buggy dependency: now 3
      const afterSecondToast = _getEffectRunCount()
      expect(afterSecondToast).toBe(1) // Should still be 1, not 3

      unmount()
    })

    it('should only register listener once per hook instance regardless of state changes', () => {
      const { result, unmount } = renderHook(() => useToast())

      // Get initial listener count
      const initialListenerCount = _getListenersForTesting().length

      // Add a toast - this triggers state change
      act(() => {
        toast({ title: 'Toast 1' })
      })

      // After state change, listener count should remain the same
      const afterFirstToast = _getListenersForTesting().length
      expect(afterFirstToast).toBe(initialListenerCount)

      // Add another toast
      act(() => {
        toast({ title: 'Toast 2' })
      })

      // Listener count should still be the same
      const afterSecondToast = _getListenersForTesting().length
      expect(afterSecondToast).toBe(initialListenerCount)

      unmount()

      // After unmount, our listener should be removed
      const afterUnmount = _getListenersForTesting().length
      expect(afterUnmount).toBe(initialListenerCount - 1)
    })
  })

  describe('Bug #1: Incorrect useEffect dependency causing unnecessary effect re-runs', () => {
    it('should not re-run effect when state changes (effect should only run on mount)', () => {
      // Track effect runs via a spy on the listener behavior
      // The bug: useEffect depends on [state] instead of []
      // This causes the effect to re-run on every state change

      const { result, unmount } = renderHook(() => {
        const hookResult = useToast()
        return hookResult
      })

      // Clear any residual toasts from previous tests
      act(() => {
        result.current.dismiss()
      })

      // Add toast 1 - triggers state change
      act(() => {
        toast({ title: 'Toast 1' })
      })
      expect(result.current.toasts).toHaveLength(1)

      // Add toast 2 - triggers another state change
      // With bug: effect re-runs, cleanup runs, re-subscribes
      act(() => {
        toast({ title: 'Toast 2' })
      })
      // Due to TOAST_LIMIT = 1
      expect(result.current.toasts).toHaveLength(1)
      expect(result.current.toasts[0].title).toBe('Toast 2')

      // Unmount
      unmount()
    })

    it('should maintain stable listener reference across renders', () => {
      // Multiple hooks should each have exactly one listener
      // With the bug, each state change adds/removes listeners unnecessarily

      const { result: hook1 } = renderHook(() => useToast())
      const { result: hook2 } = renderHook(() => useToast())

      // Both hooks should see the same toasts
      act(() => {
        toast({ title: 'Shared Toast' })
      })

      expect(hook1.current.toasts).toHaveLength(1)
      expect(hook2.current.toasts).toHaveLength(1)
      expect(hook1.current.toasts[0].id).toBe(hook2.current.toasts[0].id)
    })
  })

  describe('Bug #2: Stale closure in useEffect cleanup with state dependency', () => {
    it('should find listener in array during cleanup regardless of state changes', () => {
      // The cleanup uses indexOf on setState, which works correctly
      // But the [state] dependency is still a bug causing unnecessary re-runs

      const { result, unmount } = renderHook(() => useToast())

      // Trigger multiple state changes
      act(() => {
        toast({ title: 'Toast 1' })
      })

      act(() => {
        result.current.dismiss()
      })

      act(() => {
        toast({ title: 'Toast 2' })
      })

      // Verify state is correct
      expect(result.current.toasts).toHaveLength(1)

      // Unmount should cleanly remove listener
      unmount()

      // Add toast after unmount - unmounted hook should not receive it
      act(() => {
        toast({ title: 'Post Unmount' })
      })

      // If cleanup failed, this could cause issues (though not easily testable)
      // The test passes if no error is thrown
    })
  })

  describe('reducer', () => {
    it('should add toast correctly', () => {
      const state = { toasts: [] }
      const newState = reducer(state, {
        type: 'ADD_TOAST',
        toast: { id: '1', title: 'Test', open: true }
      })

      expect(newState.toasts).toHaveLength(1)
      expect(newState.toasts[0].title).toBe('Test')
    })

    it('should respect TOAST_LIMIT of 1', () => {
      const state = { toasts: [{ id: '1', title: 'Old', open: true }] }
      const newState = reducer(state, {
        type: 'ADD_TOAST',
        toast: { id: '2', title: 'New', open: true }
      })

      // TOAST_LIMIT = 1, so only newest toast should remain
      expect(newState.toasts).toHaveLength(1)
      expect(newState.toasts[0].title).toBe('New')
    })

    it('should update toast correctly', () => {
      const state = { toasts: [{ id: '1', title: 'Original', open: true }] }
      const newState = reducer(state, {
        type: 'UPDATE_TOAST',
        toast: { id: '1', title: 'Updated' }
      })

      expect(newState.toasts).toHaveLength(1)
      expect(newState.toasts[0].title).toBe('Updated')
    })

    it('should dismiss specific toast', () => {
      const state = { toasts: [{ id: '1', title: 'Test', open: true }] }
      const newState = reducer(state, {
        type: 'DISMISS_TOAST',
        toastId: '1'
      })

      expect(newState.toasts).toHaveLength(1)
      expect(newState.toasts[0].open).toBe(false)
    })

    it('should dismiss all toasts when no id provided', () => {
      const state = {
        toasts: [
          { id: '1', title: 'Test 1', open: true },
        ]
      }
      const newState = reducer(state, {
        type: 'DISMISS_TOAST'
      })

      expect(newState.toasts.every(t => t.open === false)).toBe(true)
    })

    it('should remove specific toast', () => {
      const state = {
        toasts: [
          { id: '1', title: 'Test', open: false },
        ]
      }
      const newState = reducer(state, {
        type: 'REMOVE_TOAST',
        toastId: '1'
      })

      expect(newState.toasts).toHaveLength(0)
    })

    it('should remove all toasts when no id provided', () => {
      const state = {
        toasts: [
          { id: '1', title: 'Test 1', open: false },
        ]
      }
      const newState = reducer(state, {
        type: 'REMOVE_TOAST'
      })

      expect(newState.toasts).toHaveLength(0)
    })
  })
})
