import { ref } from 'vue-demi'
import { useEventListener } from '../useEventListener'
import type { ConfigurableWindow } from '../_configurable'
import { defaultWindow } from '../_configurable'
import type { Position } from '../types'

export interface MouseOptions extends ConfigurableWindow {
  /**
   * Mouse position based by page or client
   *
   * @default 'page'
   */
  type?: 'page' | 'client'
  /**
   * Listen to `touchmove` events
   *
   * @default true
   */
  touch?: boolean

  /**
   * Reset to initial value when `touchend` event fired
   *
   * @default false
   */
  resetOnTouchEnds?: boolean

  /**
   * Initial values
   */
  initialValue?: Position
}

export type MouseSourceType = 'mouse' | 'touch' | null

/**
 * Reactive mouse position.
 *
 * @see https://vueuse.org/useMouse
 * @param options
 */
export function useMouse(options: MouseOptions = {}) {
  const {
    type = 'page',
    touch = true,
    resetOnTouchEnds = false,
    initialValue = { x: 0, y: 0 },
    window = defaultWindow,
  } = options

  const x = ref(initialValue.x)
  const y = ref(initialValue.y)
  const sourceType = ref<MouseSourceType>(null)

  const mouseHandler = (event: MouseEvent) => {
    if (type === 'page') {
      x.value = event.pageX
      y.value = event.pageY
    }
    else if (type === 'client') {
      x.value = event.clientX
      y.value = event.clientY
    }
    sourceType.value = 'mouse'
  }
  const reset = () => {
    x.value = initialValue.x
    y.value = initialValue.y
  }
  const touchHandler = (event: TouchEvent) => {
    if (event.touches.length > 0) {
      const touch = event.touches[0]
      if (type === 'page') {
        x.value = touch.pageX
        y.value = touch.pageY
      }
      else if (type === 'client') {
        x.value = touch.clientX
        y.value = touch.clientY
      }
      sourceType.value = 'touch'
    }
  }

  if (window) {
    useEventListener(window, 'mousemove', mouseHandler, { passive: true })
    useEventListener(window, 'dragover', mouseHandler, { passive: true })
    if (touch) {
      useEventListener(window, 'touchstart', touchHandler, { passive: true })
      useEventListener(window, 'touchmove', touchHandler, { passive: true })
      if (resetOnTouchEnds)
        useEventListener(window, 'touchend', reset, { passive: true })
    }
  }

  return {
    x,
    y,
    sourceType,
  }
}

export type UseMouseReturn = ReturnType<typeof useMouse>
