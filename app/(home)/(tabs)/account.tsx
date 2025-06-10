import icons from '@/assets/icons/icons'
import { images } from '@/assets/images/images'
import BlurView from '@/components/BlurView'
import Countdown from '@/components/Countdown'
import ConfirmDialog from '@/components/dialogs/ConfirmDialog'
import PremiumLimitModal from '@/components/dialogs/PremiumLimitModal'
import FileExporter from '@/components/FileExporter'
import Icon from '@/components/Icon'
import { useAuth } from '@/components/providers/AuthProvider'
import ReferralCode from '@/components/ReferralCode'
import SettingsBox from '@/components/SettingsBox'
import Text from '@/components/Text'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { refresh, setRefreshing } from '@/lib/reducers/loadReducer'
import { capitalize, shortName } from '@/lib/string'
import { useColorScheme } from '@/lib/useColorScheme'
import { cn, getAdmobId } from '@/lib/utils'
import { deleteAllDataApi, updateUserApi } from '@/requests'
import Constants from 'expo-constants'
import { Redirect, router } from 'expo-router'
import {
  LucideBookCopy,
  LucideChevronRight,
  LucideInfo,
  LucidePencil,
  LucideSave,
  LucideScanFace,
  LucideShieldQuestion,
  LucideWalletCards,
  LucideX,
  Moon,
  Sun,
} from 'lucide-react-native'
import moment from 'moment'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native'
import { RefreshControl, TextInput } from 'react-native-gesture-handler'
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads'
import Toast from 'react-native-toast-message'

const adUnitId = getAdmobId('BANNER')

function AccountPage() {
  // hooks
  const { user, isPremium, logout, switchBiometric, biometric, refreshToken, loggingOut } = useAuth()
  const { t: translate, i18n } = useTranslation()
  const t = useCallback((key: string) => translate('accountPage.' + key), [translate])
  const tError = useCallback((key: string) => translate('error.' + key), [translate])
  const { colorScheme, setColorScheme } = useColorScheme()
  const dispatch = useAppDispatch()
  const locale = i18n.language

  // store
  const { refreshing } = useAppSelector(state => state.load)

  // states
  const [deleting, setDeleting] = useState<boolean>(false)
  const [editMode, setEditMode] = useState<boolean>(false)
  const [usnValue, setUsnValue] = useState<string>(shortName(user, ''))
  const [updating, setUpdating] = useState<boolean>(false)
  const [nameError, setNameError] = useState<string>('')
  const [openPremiumModal, setOpenPremiumModal] = useState<boolean>(false)

  // ad states
  const [adLoadFailed, setAdLoadFailed] = useState<boolean>(false)

  // MARK: Delete Data
  const handleDeleteData = useCallback(async () => {
    // start loading
    setDeleting(true)

    try {
      const { message } = await deleteAllDataApi(locale)
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
  }, [dispatch, locale])

  // handle update settings
  const handleChangeUsername = useCallback(async () => {
    if (!user) return
    if (!usnValue.trim()) return
    if (usnValue.trim().length < 5) return setNameError('Username must be at least 5 characters')

    // start loading
    setUpdating(true)

    try {
      const data: any = {}
      // change username if local auth, change name if 3rd party auth
      if (user.authType === 'local') data.username = usnValue.trim()
      else data.name = usnValue.trim()
      await updateUserApi(data)

      // reset
      setEditMode(false)
      setNameError('')
      refreshToken()
    } catch (err: any) {
      err.errorCode === 'USERNAME_EXISTS'
        ? setNameError(err.message)
        : setNameError('Failed to change username')
    } finally {
      // stop loading
      setUpdating(false)
    }
  }, [refreshToken, user, usnValue])

  if (!user) return <Redirect href="/auth/sign-in" />

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
        <View className="gap-21/2 p-21/2 md:p-21">
          {/* MARK: User */}
          <View className="shadow-md">
            <BlurView
              intensity={90}
              className="overflow-hidden rounded-xl border border-primary/10 px-21 py-6 pb-21/2"
            >
              <View className="w-full flex-row items-center gap-4 pb-2">
                {user.authType === 'google' && (
                  <View className="relative aspect-square max-w-[40px] flex-1 rounded-full shadow-sm">
                    <Image
                      className="h-full w-full rounded-full object-cover"
                      source={{ uri: user.avatar }}
                      width={50}
                      height={50}
                      alt="avatar"
                    />
                    {isPremium && (
                      <Image
                        className="absolute"
                        style={{
                          top: -16,
                          right: -5,
                          width: 28,
                          height: 28,
                          transform: 'rotate(24deg)',
                        }}
                        source={icons.crown}
                        resizeMode="contain"
                      />
                    )}
                  </View>
                )}
                <View className="flex-1">
                  <View className="flex-1 flex-row items-center gap-2">
                    {!editMode ? (
                      <>
                        <Text className="text-xl font-bold">{shortName(user)}</Text>
                        <View className="h-5 w-5">
                          <Image
                            source={
                              icons[
                                user.authType + capitalize(colorScheme === 'light' ? 'Dark' : 'Light')
                              ]
                            }
                            resizeMode="contain"
                            className="h-full w-full"
                          />
                        </View>
                      </>
                    ) : (
                      <View>
                        {nameError && (
                          <Text className="mb-0.5 text-sm text-rose-500 drop-shadow-lg">
                            {tError(nameError)}
                          </Text>
                        )}
                        <TextInput
                          className={cn(
                            'mb-1 w-[200px] rounded-lg bg-primary/20 px-21/2 py-2 font-medium tracking-wider text-primary'
                          )}
                          placeholder={t('Username') + '...'}
                          value={usnValue}
                          onChangeText={value => setUsnValue(value)}
                          onFocus={() => setNameError('')}
                        />
                      </View>
                    )}
                  </View>
                  <Text className="flex-row items-center gap-2 text-muted-foreground">{user.email}</Text>
                </View>

                <View className="h-full flex-row items-start gap-2.5">
                  {!updating && (
                    <TouchableOpacity
                      className="py-2.5"
                      onPress={() => {
                        setEditMode(!editMode)
                        setNameError('')
                      }}
                    >
                      {editMode ? (
                        <Icon
                          render={LucideX}
                          size={18}
                        />
                      ) : (
                        <Icon
                          render={LucidePencil}
                          size={16}
                        />
                      )}
                    </TouchableOpacity>
                  )}

                  {usnValue.trim() && usnValue.trim() !== shortName(user) && !updating && editMode && (
                    <TouchableOpacity
                      className="py-2.5"
                      onPress={handleChangeUsername}
                    >
                      <Icon
                        render={LucideSave}
                        size={18}
                        color="#4ade80"
                      />
                    </TouchableOpacity>
                  )}

                  {updating && (
                    <View className="py-2.5">
                      <ActivityIndicator />
                    </View>
                  )}
                </View>
              </View>
              <View className="mt-2 border-t border-primary py-2">
                <Text className="text-center text-lg font-semibold capitalize">
                  {isPremium ? t('Premium Account') : t('Free Account')}
                </Text>
              </View>
            </BlurView>
          </View>

          {/* MARK: Referral Code */}
          <View className="shadow-md">
            <BlurView
              intensity={90}
              className="overflow-hidden rounded-xl border border-primary/10 px-21 py-21/2"
            >
              <ReferralCode />
            </BlurView>
          </View>

          {/* MARK: Flash Sale */}
          {!isPremium && (
            <ImageBackground
              source={images.preBg}
              className="gap-2 overflow-hidden rounded-xl border border-primary/10 px-21 py-21/2"
            >
              <View className="flex-row justify-between gap-2">
                <Text className="text-lg font-semibold text-neutral-800">{t('Flash Sale')}</Text>
                <Countdown
                  timeType="loop"
                  duration={7 * 24 * 60} // 7 days
                  start={moment().startOf('week').toISOString()}
                  textClassName="text-neutral-800 "
                />
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                className="aspect-video flex-row justify-center shadow-md md:justify-start"
                style={{ maxHeight: 200 }}
                onPress={() => router.push('/premium')}
              >
                <Image
                  source={images.flashSale}
                  resizeMode="cover"
                  className="h-full w-full rounded-3xl shadow-lg"
                />
              </TouchableOpacity>
            </ImageBackground>
          )}

          {/* MARK: Categories & Wallets */}
          <View className="shadow-md">
            <BlurView
              intensity={90}
              className="overflow-hidden rounded-xl border border-primary/10 px-21 py-2"
            >
              <TouchableOpacity
                onPress={() => router.push('/wallets')}
                className="h-10 flex-row items-center gap-2"
              >
                <Icon
                  render={LucideWalletCards}
                  size={18}
                />
                <Text className="text-lg font-semibold">{t('Wallets')}</Text>
                <View className="flex-1 flex-row items-center justify-end">
                  <Icon
                    render={LucideChevronRight}
                    size={18}
                  />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push('/categories')}
                className="h-10 flex-row items-center gap-2"
              >
                <Icon
                  render={LucideBookCopy}
                  size={18}
                />
                <Text className="text-lg font-semibold">{t('Categories')}</Text>
                <View className="flex-1 flex-row items-center justify-end">
                  <Icon
                    render={LucideChevronRight}
                    size={18}
                  />
                </View>
              </TouchableOpacity>
            </BlurView>
          </View>

          {/* MARK: Theme */}
          <View className="shadow-md">
            <BlurView
              intensity={90}
              className="flex-row items-center gap-2 overflow-hidden rounded-xl border border-primary/10 px-21 py-2"
            >
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
                    label={t('System')}
                  />
                  <SelectItem
                    value="light"
                    label={t('Light')}
                  />
                  <SelectItem
                    value="dark"
                    label={t('Dark')}
                  />
                </SelectContent>
              </Select>
            </BlurView>
          </View>

          {/* MARK: Biometric */}
          {biometric.isSupported && (
            <View className="shadow-md">
              <BlurView
                intensity={90}
                className="flex-row items-center gap-2 overflow-hidden rounded-xl border border-primary/10 px-21 py-2"
              >
                <Icon
                  render={LucideScanFace}
                  size={20}
                />
                <Text className="text-lg font-semibold">{t('Biometric Lock')}</Text>
                <View className="flex-1 flex-row items-center justify-end">
                  <Switch
                    checked={biometric.open}
                    onCheckedChange={() => (isPremium ? switchBiometric() : setOpenPremiumModal(true))}
                    className={cn(biometric.open ? 'bg-primary' : 'bg-muted-foreground')}
                    style={{ transform: [{ scale: 0.9 }] }}
                  />
                </View>
              </BlurView>
            </View>
          )}

          {/* MARK: Ads */}
          {!isPremium && !adLoadFailed && (
            <View className="shadow-md">
              <BlurView
                intensity={90}
                tint="prominent"
                className="items-center justify-center overflow-hidden rounded-xl border border-primary/10"
              >
                <BannerAd
                  unitId={adUnitId}
                  size={BannerAdSize.INLINE_ADAPTIVE_BANNER}
                  onAdFailedToLoad={() => setAdLoadFailed(true)}
                />
              </BlurView>
            </View>
          )}

          {/* MARK: Settings & Exporter */}
          <SettingsBox isRequireInit />

          <FileExporter className="rounded-xl border border-primary/10 px-21 py-2" />

          {/* MARK: More */}
          <View className="shadow-md">
            <BlurView
              intensity={90}
              className="overflow-hidden rounded-xl border border-primary/10 px-21 py-2"
            >
              <TouchableOpacity
                onPress={() => router.push('/more/about')}
                className="h-11 flex-row items-center gap-2"
              >
                <Icon
                  render={LucideInfo}
                  size={18}
                />
                <Text className="text-lg font-semibold">{t('About')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push('/more/help-and-support')}
                className="h-11 flex-row items-center gap-2"
              >
                <Icon
                  render={LucideShieldQuestion}
                  size={18}
                />
                <Text className="text-lg font-semibold">{t('Help & Support')}</Text>
              </TouchableOpacity>
            </BlurView>
          </View>

          <Text className="text-center font-medium text-muted-foreground">
            {t('Version')} {Constants.expoConfig?.version || '1.0.0'}
          </Text>

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
                  className={cn(
                    'mt-8 w-full border-rose-500 bg-rose-500/10',
                    loggingOut && 'opacity-50'
                  )}
                  disabled={loggingOut}
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
                className={cn('mt-8 w-full border-rose-500 bg-rose-500/10', loggingOut && 'opacity-50')}
                disabled={loggingOut}
              >
                {loggingOut ? (
                  <ActivityIndicator />
                ) : (
                  <Text className="font-semibold capitalize text-rose-500">{t('Log Out')}</Text>
                )}
              </Button>
            }
          />
        </View>

        <Separator className="my-16 h-0" />
      </ScrollView>

      <PremiumLimitModal
        open={openPremiumModal}
        close={() => setOpenPremiumModal(false)}
        label={t('Please upgrade to Premium to unlock this feature')}
        confirmLabel={t('Upgrade Now')}
        cancelLabel={t('Cancel')}
        onConfirm={() => router.push('/premium')}
      />
    </SafeAreaView>
  )
}

export default AccountPage
