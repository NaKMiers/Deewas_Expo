import icons from '@/assets/icons/icons'
import { images } from '@/assets/images/images'
import Countdown from '@/components/Countdown'
import ConfirmDialog from '@/components/dialogs/ConfirmDialog'
import Icon from '@/components/Icon'
import Image from '@/components/Image'
import { useAuth } from '@/components/providers/AuthProvider'
import SettingsBox from '@/components/SettingsBox'
import Text from '@/components/Text'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { refresh, setRefreshing } from '@/lib/reducers/loadReducer'
import { useColorScheme } from '@/lib/useColorScheme'
import { deleteAllDataApi } from '@/requests'
import { router } from 'expo-router'
import {
  LucideBookCopy,
  LucideChevronRight,
  LucideInfo,
  LucideShieldQuestion,
  Moon,
  Sun,
} from 'lucide-react-native'
import moment from 'moment'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, SafeAreaView, ScrollView, TouchableOpacity, View } from 'react-native'
import { RefreshControl } from 'react-native-gesture-handler'
import Toast from 'react-native-toast-message'

function AccountPage() {
  // hooks
  const { user, logout } = useAuth()
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('accountPage.' + key)
  const { colorScheme, setColorScheme } = useColorScheme()
  const dispatch = useAppDispatch()

  // store
  const { refreshing } = useAppSelector(state => state.load)

  // states
  const [deleting, setDeleting] = useState<boolean>(false)

  // MARK: Delete Data
  const handleDeleteData = useCallback(async () => {
    // start loading
    setDeleting(true)

    try {
      const { message } = await deleteAllDataApi()
      Toast.show({
        type: 'success',
        text1: message,
      })

      dispatch(refresh())
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: err.message,
      })
      console.log(err)
    } finally {
      // stop loading
      setDeleting(false)
      dispatch(setRefreshing(false))
    }
  }, [dispatch, t])

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
        <View className="flex flex-col gap-21/2 p-21/2 md:p-21">
          {/* MARK: Account */}
          <View className="overflow-auto rounded-md border border-border bg-secondary px-21 py-21/2">
            <View className="flex w-full flex-row items-center gap-2 pb-2">
              <View className="aspect-square max-w-[40px] flex-1 overflow-hidden rounded-full shadow-sm">
                <Image
                  className="h-full w-full object-cover"
                  source={{ uri: user?.avatar }}
                  fallbackSource={images.defaultAvatar}
                  width={50}
                  height={50}
                  alt="avatar"
                />
              </View>
              <View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-xl font-bold">{user?.username}</Text>
                  <View className="h-5 w-5">
                    <Image
                      source={icons.google}
                      resizeMode="contain"
                      className="h-full w-full"
                    />
                  </View>
                </View>
                <Text className="flex flex-row items-center gap-2 text-muted-foreground">
                  {user?.email}
                </Text>
              </View>
            </View>
            <View className="mt-21/2 border-t border-primary py-2">
              <Text className="text-center text-lg font-semibold capitalize">{t('Free Account')}</Text>
            </View>
          </View>

          {/* MARK: Ads */}
          <View className="flex flex-col gap-2 rounded-md border border-border bg-secondary px-21 py-21/2">
            <View className="flex flex-row justify-between gap-2">
              <Text className="text-lg font-semibold">{t('Flash Sale')}</Text>
              <Countdown
                timeType="once"
                start={moment().startOf('day').toISOString()}
                expire={moment().endOf('day').toISOString()}
              />
            </View>

            <View
              className="w-full overflow-hidden rounded-lg shadow-lg"
              style={{ height: 165 }}
            >
              <View>
                <Image
                  source={images.flashSale}
                  resizeMode="contain"
                  className="h-full w-full"
                />
              </View>
            </View>
          </View>

          {/* MARK: Categories & Wallets */}
          <View className="flex flex-col rounded-md border border-border bg-secondary px-21 py-2">
            <TouchableOpacity
              onPress={() => router.push('/categories')}
              className="flex h-10 flex-row items-center gap-2"
            >
              <Icon
                render={LucideBookCopy}
                size={18}
              />
              <Text className="text-lg font-semibold">{t('Categories')}</Text>
              <View className="flex flex-1 flex-row items-center justify-end">
                <Icon
                  render={LucideChevronRight}
                  size={18}
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* MARK: Theme */}
          <View className="flex flex-row items-center gap-2 rounded-md border border-border bg-secondary px-21 py-2">
            <Text className="text-lg font-semibold">{t('Theme')}</Text>

            <Select onValueChange={option => setColorScheme(option?.value as 'light' | 'dark')}>
              <SelectTrigger>
                {colorScheme === 'light' ? (
                  <Icon
                    render={Sun}
                    size={18}
                  />
                ) : (
                  <Icon
                    render={Moon}
                    size={18}
                  />
                )}
                <Text className="ml-1 capitalize">{t(colorScheme)}</Text>
              </SelectTrigger>

              <SelectContent>
                <SelectItem
                  value="system"
                  label="System"
                />
                <SelectItem
                  value="light"
                  label="Light"
                />
                <SelectItem
                  value="dark"
                  label="Dark"
                />
              </SelectContent>
            </Select>
          </View>

          {/* MARK: Settings */}
          <SettingsBox isRequireInit />

          {/* MARK: More */}
          <View className="flex flex-col rounded-lg border border-border bg-secondary px-21 py-2">
            <TouchableOpacity
              onPress={() => router.push('/more/about')}
              className="flex h-11 flex-row items-center gap-2"
            >
              <Icon
                render={LucideInfo}
                size={18}
              />
              <Text className="text-lg font-semibold">{t('About')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/more/help-and-support')}
              className="flex h-11 flex-row items-center gap-2"
            >
              <Icon
                render={LucideShieldQuestion}
                size={18}
              />
              <Text className="text-lg font-semibold">{t('Help & Support')}</Text>
            </TouchableOpacity>
          </View>

          {/* MARK: Danger */}
          <ConfirmDialog
            label={t('Delete All Data')}
            desc={t('Are you sure you want to delete all your data? This action is irreversible')}
            confirmLabel={t('Delete')}
            cancelLabel={t('Cancel')}
            onConfirm={handleDeleteData}
            trigger={
              !deleting ? (
                <Button
                  variant="outline"
                  className="mt-8 w-full border-rose-500 bg-rose-500/5"
                >
                  <Text className="font-semibold capitalize text-rose-500">{t('Delete All Data')}</Text>
                </Button>
              ) : (
                <ActivityIndicator />
              )
            }
          />

          <ConfirmDialog
            label={t('Log Out')}
            desc={t('Are you sure you want to log out?')}
            confirmLabel={t('Log Out')}
            cancelLabel="Cancel"
            onConfirm={logout}
            trigger={
              <Button
                variant="outline"
                className="mt-8 w-full border-rose-500 bg-rose-500/5"
              >
                <Text className="font-semibold capitalize text-rose-500">{t('Log Out')}</Text>
              </Button>
            }
          />
        </View>

        <Separator className="my-16 h-0" />
      </ScrollView>
    </SafeAreaView>
  )
}

export default AccountPage
