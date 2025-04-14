import React, { createContext, ReactNode, useContext, useState } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import Drawer from '../Drawer'
import Drawer0 from '../Drawer0'
import Drawer2 from '../Drawer2'
import Drawer3 from '../Drawer3'

interface DrawerContextType {
  openDrawer0: (content: ReactNode, reach?: number) => void
  openDrawer: (content: ReactNode, reach?: number) => void
  openDrawer2: (content: ReactNode, reach?: number) => void
  openDrawer3: (content: ReactNode, reach?: number) => void
  closeDrawer0: () => void
  closeDrawer: () => void
  closeDrawer2: () => void
  closeDrawer3: () => void
  content0: ReactNode | null
  content: ReactNode | null
  content2: ReactNode | null
  content3: ReactNode | null
  open0: boolean
  open: boolean
  open2: boolean
  open3: boolean
  reach0: number
  reach: number
  reach2: number
  reach3: number
}

const DrawerContext = createContext<DrawerContextType | undefined>(undefined)

const DEFAULT_REACH = 2
function DrawerProvider({ children }: { children: ReactNode }) {
  const [open0, setOpen0] = useState<boolean>(false)
  const [open, setOpen] = useState<boolean>(false)
  const [open2, setOpen2] = useState<boolean>(false)
  const [open3, setOpen3] = useState<boolean>(false)
  const [content0, setContent0] = useState<ReactNode | null>(null)
  const [content, setContent] = useState<ReactNode | null>(null)
  const [content2, setContent2] = useState<ReactNode | null>(null)
  const [content3, setContent3] = useState<ReactNode | null>(null)
  const [reach0, setReach0] = useState<number>(DEFAULT_REACH)
  const [reach, setReach] = useState<number>(DEFAULT_REACH)
  const [reach2, setReach2] = useState<number>(DEFAULT_REACH)
  const [reach3, setReach3] = useState<number>(DEFAULT_REACH)

  const openDrawer0 = (content: ReactNode, reach?: number) => {
    setContent0(content)
    setOpen0(true)
    setReach0(reach || DEFAULT_REACH)
  }

  const openDrawer = (content: ReactNode, reach?: number) => {
    setContent(content)
    setOpen(true)
    setReach(reach || DEFAULT_REACH)
  }

  const openDrawer2 = (content: ReactNode, reach?: number) => {
    setContent2(content)
    setOpen2(true)
    setReach2(reach || DEFAULT_REACH)
  }

  const openDrawer3 = (content: ReactNode, reach?: number) => {
    setContent3(content)
    setOpen3(true)
    setReach3(reach || DEFAULT_REACH)
  }

  const closeDrawer0 = () => {
    setOpen0(false)
    setContent0(null)
    setReach0(2)
  }

  const closeDrawer = () => {
    setOpen(false)
    setContent(null)
    setReach(2)
  }

  const closeDrawer2 = () => {
    setOpen2(false)
    setContent2(null)
    setReach2(2)
  }

  const closeDrawer3 = () => {
    setOpen3(false)
    setContent3(null)
    setReach3(2)
  }

  return (
    <GestureHandlerRootView className='flex-1'>
      <DrawerContext.Provider
        value={{
          openDrawer0,
          openDrawer,
          openDrawer2,
          openDrawer3,
          closeDrawer0,
          closeDrawer,
          closeDrawer2,
          closeDrawer3,
          content0,
          content,
          content2,
          content3,
          open0,
          open,
          open2,
          open3,
          reach0,
          reach,
          reach2,
          reach3,
        }}
      >
        {children}

        <Drawer0 />
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
