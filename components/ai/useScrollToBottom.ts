import { RefObject, useCallback, useEffect, useRef, useState } from 'react'
import { Keyboard, ScrollView, View } from 'react-native'

export function useScrollToBottom(
  messages: any[],
  isStreaming: boolean = false
): [RefObject<ScrollView>, RefObject<View>, Function, boolean] {
  const containerRef = useRef<ScrollView>(null)
  const endRef = useRef<View>(null)
  const [isAtBottom, setIsAtBottom] = useState<boolean>(true)
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)

  // Handle scroll position to toggle button visibility
  const handleScroll = useCallback((event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent
    const isBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20
    setIsAtBottom(isBottom)
  }, [])

  useEffect(() => {
    const scrollView = containerRef.current
    if (!scrollView) return

    setTimeout(() => {
      scrollView.scrollToEnd({ animated: true })
    }, 0)
  }, [messages, isStreaming, isKeyboardOpen])

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

  return [containerRef, endRef, handleScroll, isAtBottom]
}
