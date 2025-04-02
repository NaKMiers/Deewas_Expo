// OriginalScreen.tsx
import { useAppDispatch } from '@/hooks/reduxHook'
import { useColorScheme } from '@/lib/useColorScheme'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import React, { useEffect, useMemo, useRef } from 'react'
import { Keyboard, SafeAreaView, TouchableWithoutFeedback } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { useDrawer } from './providers/DrawerProvider'

function Drawer() {
  // hooks
  const { isDarkColorScheme } = useColorScheme()
  const dispatch = useAppDispatch()
  const snapPoints = useMemo(() => ['55%', '80%', '100%'], [])
  const { open, content, closeDrawer } = useDrawer()

  const drawerRef = useRef<BottomSheet>(null)

  useEffect(() => {
    if (open) drawerRef.current?.snapToIndex(2)
    else drawerRef.current?.close()
  }, [open])

  return (
    <BottomSheet
      ref={drawerRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      onChange={(index: number) => {
        if (index === -1) closeDrawer()
        if (index === 0) drawerRef.current?.close()
      }}
      backgroundStyle={{
        backgroundColor: isDarkColorScheme ? '#161616' : '#fff',
      }}
      handleIndicatorStyle={{
        backgroundColor: isDarkColorScheme ? '#fff' : '#161616',
      }}
    >
      <BottomSheetView style={{ flex: 1, paddingTop: 21 / 2, paddingLeft: 32, paddingRight: 32 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <SafeAreaView className="mx-auto w-full max-w-[500px] flex-1">
            <ScrollView>{content}</ScrollView>
          </SafeAreaView>
        </TouchableWithoutFeedback>
      </BottomSheetView>
    </BottomSheet>
  )
}

export default Drawer
