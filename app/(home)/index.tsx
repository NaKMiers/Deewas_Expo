import LatestTransactions from '@/components/LatestTransactions'
import OverviewCard from '@/components/OverviewCard'
import { Separator } from '@/components/ui/separator'
import Wallets from '@/components/Wallets'
import React from 'react'
import { ScrollView, View } from 'react-native'

function HomePage() {
  return (
    <ScrollView className="container">
      <OverviewCard />

      <Separator className="my-4 h-0" />

      <Wallets />

      <Separator className="my-8 h-0" />

      {/* <History /> */}

      <Separator className="my-8 h-0" />

      <LatestTransactions />

      <Separator className="my-16 h-0" />

      {/* <Creations /> */}
    </ScrollView>
  )
}

export default HomePage
