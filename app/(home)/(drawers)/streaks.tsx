import icons from '@/assets/icons/icons'
import DrawerWrapper from '@/components/DrawerWrapper'
import Image from '@/components/Image'
import { useAuth } from '@/components/providers/AuthProvider'
import Text from '@/components/Text'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { setStats } from '@/lib/reducers/userReducer'
import { getLocale, shortName } from '@/lib/string'
import { toUTC } from '@/lib/time'
import { getUserStatsApi } from '@/requests'
import { Separator } from '@rn-primitives/select'
import { format } from 'date-fns'
import { BlurView } from 'expo-blur'
import { router } from 'expo-router'
import moment from 'moment'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TouchableOpacity, View } from 'react-native'

function StreaksPage() {
  // hooks
  const { user } = useAuth()
  const { t: translate, i18n } = useTranslation()
  const t = useCallback((key: string) => translate('streaksPage.' + key), [translate])
  const locale = i18n.language
  const dispatch = useAppDispatch()

  // store
  const stats = useAppSelector(state => state.user.stats)

  // states
  const [statList, setStatList] = useState<{ title: string; value: number }[] | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [transactionDays, setTransactionDays] = useState<string[]>([])
  const [weekStreak, setWeekStreak] = useState<number>(0)

  // values
  const weekStart = moment().startOf('week')
  const weekDays: moment.Moment[] = Array.from({ length: 7 }, (_, i) => moment(weekStart).add(i, 'days'))

  // get user stats
  useEffect(() => {
    const fetch = async () => {
      if (stats) return

      // start loading
      setLoading(true)

      try {
        // get stats
        const stats: Stats = await getUserStatsApi(
          `?from=${toUTC(moment().startOf('week').toDate())}&to=${toUTC(moment().endOf('week').toDate())}`
        )
        dispatch(setStats(stats))
      } catch (err: any) {
        console.log(err)
      } finally {
        // stop loading
        setLoading(false)
      }
    }

    fetch()
  }, [dispatch, stats])

  useEffect(() => {
    if (!stats) return

    // set stats list
    setStatList([
      { title: 'Transactions', value: stats.transactionCount },
      { title: 'Wallets', value: stats.walletCount },
      { title: 'Categories', value: stats.categoryCount },
      { title: 'Budgets', value: stats.budgetCount },
    ])

    // set transaction days
    const transactionDays = Array.from(
      new Set(stats.recentTransactions.map(tx => moment(tx.createdAt).format('YYYY-MM-DD')))
    )
    setTransactionDays(transactionDays)

    // set week streak
    let weekStreak = 0
    const today = moment().format('YYYY-MM-DD')
    for (let day of weekDays) {
      const dayKey = day.format('YYYY-MM-DD')
      if (dayKey > today) break
      if (transactionDays.includes(dayKey)) weekStreak++
      else break
    }
    setWeekStreak(weekStreak)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats])

  // get streak message
  const getStreakMessage = useCallback(
    (streak: number, name: string) => {
      if (streak >= 7) return `${t("You're unstoppable this week!")} ${name} 🔥🔥🔥`
      if (streak >= 5) return `${t("You're crushing it! Keep pushing")} ${name} 💪`
      if (streak >= 3) return `${t("You're building a great habit!")} ${name} 🙌`
      if (streak >= 1) return `${t('Nice! One step at a time')} ${name} 🚶‍♂️`
      return `${t('New week, new chance. Let’s get it')} ${name}! 🚀`
    },
    [t]
  )

  return (
    <DrawerWrapper>
      <View className="items-center">
        {/* Flame */}
        <View
          className="aspect-square rounded-full border border-orange-500 p-14"
          style={{ height: 250 }}
        >
          {!loading ? (
            <Image
              source={weekStreak > 0 ? icons.inStreak : icons.lostStreak}
              resizeMode="contain"
              className="h-full w-full"
            />
          ) : (
            <Skeleton className="h-full w-full rounded-full" />
          )}
        </View>

        {/* Streak Count */}
        <BlurView
          className="flex aspect-square items-center justify-center overflow-hidden rounded-full border border-orange-500"
          style={{ marginTop: -50 }}
        >
          {!loading ? (
            <Text
              className="p-3 font-body font-bold"
              style={{ fontSize: 120, lineHeight: 120, marginBottom: -8, marginTop: 18 }}
            >
              {!loading && weekStreak}
            </Text>
          ) : (
            <Skeleton className="h-[150px] w-[150px] rounded-full" />
          )}
        </BlurView>

        {/* Title & Compliment */}
        <Text className="mt-6 font-body text-3xl font-semibold tracking-widest">{t('Week Streak')}</Text>
        <Text className="text-center text-lg font-medium">
          {getStreakMessage(weekStreak, shortName(user))}
        </Text>

        {/* Week */}
        <View className="mt-6 w-full flex-row flex-wrap justify-center gap-2">
          {weekDays.map((day, i) => {
            const dayKey = day.format('YYYY-MM-DD')
            const hasTransaction = transactionDays.includes(dayKey)

            return (
              <View
                key={i}
                className="w-[calc(100%/8)] items-center"
              >
                <Image
                  source={hasTransaction ? icons.fire : icons.paleFire}
                  className="h-10 w-10 items-center justify-center rounded-full shadow-md"
                />
                <Text className="mt-1 text-center font-bold">
                  {format(day.toDate(), 'EEEEE', { locale: getLocale(locale) })}
                </Text>
              </View>
            )
          })}
        </View>

        <View className="mt-8 flex-row items-center justify-center gap-21">
          <View>
            <Text className="text-lg font-semibold">{t('Current streak')}</Text>
            <Text className="text-center text-2xl font-bold">{stats?.currentStreak}</Text>
          </View>
          <View>
            <Text className="text-lg font-semibold">{t('Longest streak')}</Text>
            <Text className="text-center text-2xl font-bold">{stats?.longestStreak}</Text>
          </View>
        </View>

        {/* Stat */}
        {!loading && statList ? (
          <BlurView
            intensity={100}
            tint="prominent"
            className="mt-8 w-full overflow-hidden rounded-3xl border border-primary/10 shadow-md"
          >
            <Text className="py-2.5 text-center text-lg font-bold">{t('Your Stats')}</Text>
            <View className="rounded-3x rounded-3xl bg-primary px-8 py-21 shadow-md">
              <View className="flex-1 flex-row flex-wrap gap-y-2">
                {statList.map((stat, i) => (
                  <View
                    className="w-1/2"
                    key={i}
                  >
                    <Text className="text-center text-lg font-semibold text-secondary">
                      {t(stat.title)}
                    </Text>
                    <Text className="text-center text-4xl font-bold text-secondary">{stat.value}</Text>
                  </View>
                ))}
              </View>
            </View>
          </BlurView>
        ) : (
          <Skeleton className="mt-8 h-[200px] w-full p-4" />
        )}

        {/* Action Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={router.back}
          className="mt-8 w-full flex-row items-center justify-center gap-21/2 rounded-full bg-orange-500 p-4 shadow-md"
        >
          <Text className="text-xl font-semibold text-white">{t('Continue')}</Text>
        </TouchableOpacity>
      </View>

      <Separator className="my-20 h-0" />
    </DrawerWrapper>
  )
}

export default StreaksPage
