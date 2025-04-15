import { useCallback } from 'react'
import Toast from 'react-native-toast-message'

function useUtils() {
  // handle copy
  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text)

    Toast.show({
      type: 'success',
      text1: 'Copied to clipboard',
      text2: text,
    })
  }, [])

  return { handleCopy }
}

export default useUtils
