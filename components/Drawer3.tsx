import { useColorScheme } from '@/lib/useColorScheme'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import React, { useEffect, useMemo, useRef } from 'react'
import { SafeAreaView } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { useDrawer } from './providers/DrawerProvider'

function Drawer3() {
  // hooks
  const { isDarkColorScheme } = useColorScheme()
  const snapPoints = useMemo(() => ['55%', '80%', '100%'], [])
  const { open3: open, content3: content, closeDrawer3: closeDrawer, reach3: reach } = useDrawer()

  const drawerRef = useRef<BottomSheet>(null)

  useEffect(() => {
    if (open) drawerRef.current?.snapToIndex(reach)
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
        <SafeAreaView className="mx-auto w-full max-w-[500px] flex-1">
          <ScrollView>{content}</ScrollView>
        </SafeAreaView>
      </BottomSheetView>
    </BottomSheet>
  )
}

export default Drawer3
