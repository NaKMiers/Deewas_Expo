import React, { createContext, ReactNode, useContext, useState } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

interface DrawerContextType {
  openDrawer: (_content: ReactNode, _reach?: number) => void
  closeDrawer: () => void
  content: ReactNode | null
  open: boolean
  reach: number
}

const DrawerContext = createContext<DrawerContextType | undefined>(undefined)

const DEFAULT_REACH = 2
function DrawerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<boolean>(false)
  const [content, setContent] = useState<ReactNode | null>(null)
  const [reach, setReach] = useState<number>(DEFAULT_REACH)

  const openDrawer = (content: ReactNode, reach?: number) => {
    setContent(content)
    setOpen(true)
    setReach(reach || DEFAULT_REACH)
  }

  const closeDrawer = () => {
    setOpen(false)
    setContent(null)
    setReach(2)
  }

  return (
    <GestureHandlerRootView className="flex-1">
      <DrawerContext.Provider
        value={{
          openDrawer,
          closeDrawer,
          content,
          open,
          reach,
        }}
      >
        {children}
      </DrawerContext.Provider>
    </GestureHandlerRootView>
  )
}

export default DrawerProvider

export function useDrawer() {
  const context = useContext(DrawerContext)
  if (!context) throw new Error('useDrawer must be used within a DrawerProvider')
  return context
}
