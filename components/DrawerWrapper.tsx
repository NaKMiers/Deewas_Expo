import React, { ReactNode } from 'react'
import { ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import BlurView from './BlurView'

function DrawerWrapper({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView className="flex-1">
      <BlurView
        className="flex-1"
        intensity={90}
      >
        <ScrollView className="flex-1">
          <View className="mx-auto w-full max-w-[500px] flex-1 p-21">{children}</View>
        </ScrollView>
      </BlurView>
    </SafeAreaView>
  )
}

export default DrawerWrapper
