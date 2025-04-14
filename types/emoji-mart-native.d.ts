declare module 'emoji-mart-native' {
  import React from 'react'

  export interface Emoji {
    id: string
    name: string
    shortcodes: string
    unified: string
    native: string
  }

  export interface PickerProps {
    onEmojiSelect: (emoji: Emoji) => void
    theme?: 'light' | 'dark'
  }

  export const Picker: React.FC<PickerProps>
}
