import React, { createContext, ReactNode, useContext, useState } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import Drawer from '../Drawer'
import Drawer2 from '../Drawer2'
import Drawer3 from '../Drawer3'

interface DrawerContextType {
  openDrawer: (content: ReactNode) => void
  openDrawer2: (content: ReactNode) => void
  openDrawer3: (content: ReactNode) => void
  closeDrawer: () => void
  closeDrawer2: () => void
  closeDrawer3: () => void
  content: ReactNode | null
  content2: ReactNode | null
  content3: ReactNode | null
  open: boolean
  open2: boolean
  open3: boolean
}

const DrawerContext = createContext<DrawerContextType | undefined>(undefined)

function DrawerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<boolean>(false)
  const [open2, setOpen2] = useState<boolean>(false)
  const [open3, setOpen3] = useState<boolean>(false)
  const [content, setContent] = useState<ReactNode | null>(null)
  const [content2, setContent2] = useState<ReactNode | null>(null)
  const [content3, setContent3] = useState<ReactNode | null>(null)

  const openDrawer = (content: ReactNode) => {
    setContent(content)
    setOpen(true)
  }

  const openDrawer2 = (content: ReactNode) => {
    setContent2(content)
    setOpen2(true)
  }

  const openDrawer3 = (content: ReactNode) => {
    setContent3(content)
    setOpen3(true)
  }

  const closeDrawer = () => {
    setOpen(false)
    setContent(null)
  }

  const closeDrawer2 = () => {
    setOpen2(false)
    setContent2(null)
  }

  const closeDrawer3 = () => {
    setOpen3(false)
    setContent3(null)
  }

  return (
    <GestureHandlerRootView className="flex-1">
      <DrawerContext.Provider
        value={{
          openDrawer,
          openDrawer2,
          openDrawer3,
          closeDrawer,
          closeDrawer2,
          closeDrawer3,
          content,
          content2,
          content3,
          open,
          open2,
          open3,
        }}
      >
        {children}

        <Drawer />
        <Drawer2 />
        <Drawer3 />
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
