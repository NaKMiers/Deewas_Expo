import { useColorScheme } from '@/lib/useColorScheme'
import BottomSheet, { BottomSheetView, MODAL_STACK_BEHAVIOR } from '@gorhom/bottom-sheet'
import React, { useEffect, useMemo, useRef } from 'react'
import { Platform, SafeAreaView, ScrollView } from 'react-native'
import { useDrawer } from './providers/DrawerProvider'
import { images } from '@/assets/images/images'
import { BlurView } from 'expo-blur'

function Drawer() {
  // hooks
  const { isDarkColorScheme } = useColorScheme()
  const snapPoints = useMemo(() => ['55%', '80%', '100%'], [])
  const { open, content, closeDrawer, reach } = useDrawer()

  const drawerRef = useRef<BottomSheet>(null)

  useEffect(() => {
    if (open) drawerRef.current?.snapToIndex(Platform.OS === 'android' ? reach - 1 : reach)
    else drawerRef.current?.close()
  }, [open, reach])

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
        backgroundColor: 'transparent',
      }}
      handleIndicatorStyle={{
        backgroundColor: isDarkColorScheme ? '#fff' : '#161616',
      }}
      handleStyle={{
        borderTopStartRadius: 16,
        borderTopEndRadius: 16,
        backgroundColor: isDarkColorScheme ? '#161616' : '#fff',
      }}
    >
      <BlurView
        className="flex-1"
        intensity={90}
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
      </BlurView>
    </BottomSheet>
  )
}

export default Drawer
