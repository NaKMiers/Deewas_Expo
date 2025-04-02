// OriginalScreen.tsx
import { useColorScheme } from '@/lib/useColorScheme'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import React, { useEffect, useMemo, useRef } from 'react'
import { Keyboard, SafeAreaView, TouchableWithoutFeedback } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { useDrawer } from './providers/DrawerProvider'

function Drawer2() {
  // hooks
  const { isDarkColorScheme } = useColorScheme()
  const snapPoints = useMemo(() => ['55%', '80%', '100%'], [])
  const { open2, content2, closeDrawer2 } = useDrawer()

  const drawerRef = useRef<BottomSheet>(null)

  useEffect(() => {
    if (open2) drawerRef.current?.snapToIndex(2)
    else drawerRef.current?.close()
  }, [open2])

  return (
    <BottomSheet
      ref={drawerRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      onChange={(index: number) => {
        if (index === -1) closeDrawer2()
        if (index === 0) drawerRef.current?.close()
      }}
      backgroundStyle={{
        backgroundColor: isDarkColorScheme ? '#222222' : '#fff',
      }}
      handleIndicatorStyle={{
        backgroundColor: isDarkColorScheme ? '#fff' : '#222222',
      }}
    >
      <BottomSheetView style={{ flex: 1, paddingTop: 21 / 2, paddingLeft: 32, paddingRight: 32 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <SafeAreaView className="mx-auto w-full max-w-[500px] flex-1">
            <ScrollView>{content2}</ScrollView>
          </SafeAreaView>
        </TouchableWithoutFeedback>
      </BottomSheetView>
    </BottomSheet>
  )
}

export default Drawer2
