import { Separator } from '@/components/ui/separator'
import Wallets from '@/components/Wallets'
import React from 'react'
import { View } from 'react-native'

function HomePage() {
  return (
    <View className="container pb-32">
      {/* <OverviewCard /> */}

      <Separator className="my-4 h-0" />

      <Wallets />

      <Separator className="my-8 h-0" />

      {/* <History /> */}

      {/* <Separator className="my-8 h-0" /> */}

      {/* <LatestTransactions /> */}

      {/* <Creations /> */}
    </View>
  )
}

export default HomePage
