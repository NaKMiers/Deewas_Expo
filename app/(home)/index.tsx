import History from '@/components/History'
import LatestTransactions from '@/components/LatestTransactions'
import Overview from '@/components/Overview'
import { Separator } from '@/components/ui/separator'
import Wallets from '@/components/Wallets'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { refresh } from '@/lib/reducers/loadReducer'
import React from 'react'
import { RefreshControl, SafeAreaView, ScrollView, View } from 'react-native'

function HomePage() {
  const dispatch = useAppDispatch()
  const { refreshing } = useAppSelector(state => state.load)

  return (
    <SafeAreaView>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => dispatch(refresh())}
          />
        }
      >
        <View className="p-21/2 md:p-21">
          <Overview />

          <Separator className="my-4 h-0" />

          <Wallets />

          <Separator className="my-4 h-0" />

          <History />

          <Separator className="my-4 h-0" />

          <LatestTransactions />
        </View>

        <Separator className="my-16 h-0" />
      </ScrollView>
    </SafeAreaView>
  )
}

export default HomePage
