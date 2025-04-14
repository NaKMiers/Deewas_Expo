import { RefObject, useCallback, useEffect, useRef, useState } from 'react'
import { Keyboard, ScrollView } from 'react-native'

export function useScrollToBottom(
  messages: any[],
  isStreaming: boolean = false
): [RefObject<ScrollView>, Function, boolean] {
  // refs
  const containerRef = useRef<ScrollView>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // states
  const [isAtBottom, setIsAtBottom] = useState<boolean>(true)
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)

  // Handle scroll position to toggle button visibility
  const handleScroll = useCallback((event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent
    const isBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20
    setIsAtBottom(isBottom)
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    if (isKeyboardOpen) {
      container.scrollToEnd({ animated: true })
    } else {
      setTimeout(() => {
        container.scrollToEnd({ animated: true })
      }, 0)
    }
  }, [messages, isKeyboardOpen, containerRef, containerRef])

  // Listen to keyboard events
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardOpen(true)
    })
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardOpen(false)
    })

    // Cleanup listeners on unmount
    return () => {
      keyboardDidShowListener.remove()
      keyboardDidHideListener.remove()
    }
  }, [])

  return [containerRef, handleScroll, isAtBottom]
}
