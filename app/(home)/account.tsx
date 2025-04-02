'use client'

import Icon from '@/components/Icon'
import { useAuth } from '@/components/providers/AuthProvider'
import SettingsBox from '@/components/SettingsBox'
import Text from '@/components/Text'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { useAppDispatch } from '@/hooks/reduxHook'
import { refetching } from '@/lib/reducers/loadReducer'
import { useColorScheme } from '@/lib/useColorScheme'
import { deleteAllDataApi } from '@/requests'
import { useRouter } from 'expo-router'
import {
  LucideBookCopy,
  LucideChevronRight,
  LucideInfo,
  LucideShieldQuestion,
  Moon,
  Sun,
} from 'lucide-react-native'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Image, SafeAreaView, ScrollView, TouchableOpacity, View } from 'react-native'
import Toast from 'react-native-toast-message'

function AccountPage({ navigation }: any) {
  // hooks
  const { user } = useAuth()
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('accountPage.', key)
  const { colorScheme, setColorScheme, isDarkColorScheme } = useColorScheme()
  const dispatch = useAppDispatch()
  const router = useRouter()

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

      dispatch(refetching())
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: err.message,
      })
      console.log(err)
    } finally {
      // stop loading
      setDeleting(false)
    }
  }, [dispatch, t])

  return (
    <SafeAreaView>
      <ScrollView>
        <View className="container flex flex-col gap-21/2 px-21/2 pb-32 pt-21/2 md:gap-21 md:px-21 md:pt-21">
          {/* MARK: Account */}
          <View className="p2 overflow-auto rounded-md border border-secondary p-2">
            <View className="flex w-full flex-row items-center gap-2 pb-2">
              <View className="aspect-square max-w-[40px] flex-shrink-0 overflow-hidden rounded-full shadow-sm">
                <Image
                  className="h-full w-full object-cover"
                  source={{ uri: user?.avatar || process.env.NEXT_PUBLIC_DEFAULT_AVATAR }}
                  width={50}
                  height={50}
                  alt="avatar"
                />
              </View>
              <View className="">
                <Text className="text-xl font-bold">{user?.username}</Text>
                <Text className="flex flex-row items-center gap-2 text-sm text-muted-foreground">
                  {user?.email}
                  <Image
                    src={`/icons/${user?.authType}.png`}
                    width={18}
                    height={18}
                    alt="google"
                  />
                </Text>
              </View>
            </View>
            <View className="border-t border-secondary py-2 text-center font-semibold capitalize">
              <Text>{t('Free Account')}</Text>
            </View>
          </View>

          {/* MARK: Ads */}
          <View className="flex flex-col gap-2 rounded-md border border-secondary px-21/2 py-2">
            <View className="flex flex-row justify-between gap-2">
              <Text className="font-semibold">{t('Flash Sale')}</Text>
              {/* <Countdown
                timeType="once"
                start={moment().startOf('day').toISOString()}
                expire={moment().endOf('day').toISOString()}
              /> */}
            </View>

            {/* <View className="flex max-w-[400px] flex-row items-center justify-center">
              <Image
                className="w-full"
                source={images.flashSale}
                resizeMode="contain"
                alt="flash-sale"
              />
            </View> */}
          </View>

          {/* MARK: Categories & Wallets */}
          <View className="flex flex-col rounded-md border border-secondary px-21/2 py-2 md:px-21">
            <TouchableOpacity
              // href="/categories"
              onPress={() => navigation.navigate('categories')}
              className="flex h-8 flex-row items-center gap-2 text-sm"
            >
              <Icon
                render={LucideBookCopy}
                size={18}
                className="cursor-pointer"
              />
              <Text className="font-semibold">{t('Categories')}</Text>
              <View className="flex flex-1 flex-row items-center justify-end">
                <Icon
                  render={LucideChevronRight}
                  size={18}
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* MARK: Theme */}
          <View className="flex flex-row items-center gap-2 rounded-md border border-secondary px-21/2 py-2 md:px-21">
            <Text className="font-semibold">{t('Theme')}</Text>

            <Select onValueChange={option => setColorScheme(option?.value as 'light' | 'dark')}>
              <SelectTrigger>
                {isDarkColorScheme ? (
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
          <View className="flex flex-col rounded-lg border border-secondary px-21/2 py-2 md:px-21">
            <TouchableOpacity
              // onPress={() => router.push('/about')}
              className="flex h-8 flex-row items-center gap-2 text-sm"
            >
              <Icon
                render={LucideInfo}
                size={18}
              />
              <Text>{t('About')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              // onPress={() => router.push('/help-and-support')}
              className="flex h-8 flex-row items-center gap-2 text-sm"
            >
              <Icon
                render={LucideShieldQuestion}
                size={18}
              />
              <Text>{t('Help & Support')}</Text>
            </TouchableOpacity>
          </View>

          {/* MARK: Danger */}
          {/* <ConfirmDialog
            label={t('Delete All Data')}
            desc={t('Are you sure you want to delete all your data? This action is irreversible')}
            confirmLabel={t('Delete')}
            cancelLabel={t('Cancel')}
            onConfirm={handleDeleteData}
            trigger={
              !deleting ? (
                <Button
                  variant="outline"
                  className="mt-8 w-full border-rose-500 text-sm font-semibold capitalize text-rose-500"
                >
                  {t('Delete All Data')}
                </Button>
              ) : (
                <Button
                  disabled
                  variant="outline"
                  className="mt-8 w-full border-rose-500 text-sm font-semibold capitalize text-rose-500"
                >
                  <LucideLoaderCircle className="animate-spin" />
                </Button>
              )
            }
          /> */}

          {/* <ConfirmDialog
            label={t('Log Out')}
            desc={t('Are you sure you want to log out?')}
            confirmLabel={t('Log Out')}
            cancelLabel="Cancel"
            onConfirm={signOut}
            trigger={
              <Button
                variant="outline"
                className="mt-8 w-full border-rose-500 text-sm font-semibold capitalize text-rose-500"
              >
                {t('Log Out')}
              </Button>
            }
          /> */}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default AccountPage
