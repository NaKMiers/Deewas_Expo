// OriginalScreen.tsx
import { useColorScheme } from '@/lib/useColorScheme'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import React, { useEffect, useMemo, useRef } from 'react'
import { Keyboard, SafeAreaView, TouchableWithoutFeedback } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { useDrawer } from './providers/DrawerProvider'

function Drawer3() {
  // hooks
  const { isDarkColorScheme } = useColorScheme()
  const snapPoints = useMemo(() => ['55%', '80%', '100%'], [])
  const { open3, content3, closeDrawer3 } = useDrawer()

  const drawerRef = useRef<BottomSheet>(null)

  useEffect(() => {
    if (open3) drawerRef.current?.snapToIndex(2)
    else drawerRef.current?.close()
  }, [open3])

  return (
    <BottomSheet
      ref={drawerRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      onChange={(index: number) => {
        if (index === -1) closeDrawer3()
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
        <TouchableWithoutFeedback
          className="flex-1"
          onPress={Keyboard.dismiss}
        >
          <SafeAreaView className="mx-auto w-full max-w-[500px] flex-1">
            <ScrollView>{content3}</ScrollView>
          </SafeAreaView>
        </TouchableWithoutFeedback>
      </BottomSheetView>
    </BottomSheet>
  )
}

export default Drawer3
