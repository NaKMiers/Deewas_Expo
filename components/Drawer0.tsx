import { useColorScheme } from '@/lib/useColorScheme'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import React, { useEffect, useMemo, useRef } from 'react'
import { Platform, SafeAreaView, ScrollView } from 'react-native'
import { useDrawer } from './providers/DrawerProvider'

function Drawer0() {
  // hooks
  const { isDarkColorScheme } = useColorScheme()
  const snapPoints = useMemo(() => ['55%', '80%', '100%'], [])
  const { open0: open, content0: content, closeDrawer0: closeDrawer, reach0: reach } = useDrawer()

  const drawerRef = useRef<BottomSheet>(null)

  useEffect(() => {
    if (open) drawerRef.current?.snapToIndex(Platform.OS === 'android' ? reach - 1 : reach)
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
        if (index === 0 && Platform.OS !== 'android') drawerRef.current?.close()
      }}
      backgroundStyle={{
        backgroundColor: isDarkColorScheme ? '#161616' : '#fff',
        borderColor: isDarkColorScheme ? '#333' : '#ccc',
        borderWidth: 2,
        borderTopWidth: 0,
        borderRadius: 24,
      }}
      handleIndicatorStyle={{
        backgroundColor: isDarkColorScheme ? '#fff' : '#161616',
      }}
      containerStyle={{}}
    >
      <BottomSheetView style={{ flex: 1, paddingTop: 21 / 2, paddingLeft: 32, paddingRight: 32 }}>
        <SafeAreaView className="mx-auto w-full max-w-[500px] flex-1">
          <ScrollView
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          >
            {content}
          </ScrollView>
        </SafeAreaView>
      </BottomSheetView>
    </BottomSheet>
  )
}

export default Drawer0
