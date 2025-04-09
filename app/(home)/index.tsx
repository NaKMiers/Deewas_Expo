import Creations from '@/components/Creations'
import History from '@/components/History'
import Icon from '@/components/Icon'
import LatestTransactions from '@/components/LatestTransactions'
import Overview from '@/components/Overview'
import { Separator } from '@/components/ui/separator'
import Wallets from '@/components/Wallets'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { refresh } from '@/lib/reducers/loadReducer'
import { LucidePlus } from 'lucide-react-native'
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

      <Creations
        reach={1}
        trigger={
          <View className="absolute bottom-2.5 right-21/2 z-20 flex h-11 w-11 flex-row items-center justify-center gap-1 rounded-full bg-primary px-4">
            <Icon
              render={LucidePlus}
              size={20}
              reverse
            />
          </View>
        }
      />
    </SafeAreaView>
  )
}

export default HomePage
