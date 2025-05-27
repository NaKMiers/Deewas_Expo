import { images } from '@/assets/images/images'
import CustomInput from '@/components/CustomInput'
import CommonFooter from '@/components/dialogs/CommonFooter'
import CommonHeader from '@/components/dialogs/CommonHeader'
import DrawerWrapper from '@/components/DrawerWrapper'
import Icon from '@/components/Icon'
import Text from '@/components/Text'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { refresh } from '@/lib/reducers/loadReducer'
import { setSelectedEmoji } from '@/lib/reducers/screenReducer'
import { checkTranType } from '@/lib/string'
import { cn } from '@/lib/utils'
import { createCategoryApi } from '@/requests/categoryRequests'
import { router, useLocalSearchParams } from 'expo-router'
import { LucideCircle, LucideCircleOff } from 'lucide-react-native'
import { useCallback, useEffect, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { ImageBackground, TouchableOpacity, View } from 'react-native'
import Collapsible from 'react-native-collapsible'
import Toast from 'react-native-toast-message'

function CreateCategoryPage() {
  // hooks
  const { t: translate } = useTranslation()
  const t = useCallback((key: string) => translate('createCategoryPage.' + key), [translate])
  const tSuccess = useCallback((key: string) => translate('success.' + key), [translate])
  const tError = useCallback((key: string) => translate('error.' + key), [translate])
  const dispatch = useAppDispatch()
  const { type } = useLocalSearchParams()

  // store
  const selectedEmoji = useAppSelector(state => state.screen.selectedEmoji)

  // form
  const {
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    clearErrors,
    watch,
  } = useForm<FieldValues>({
    defaultValues: {
      name: '',
      icon: selectedEmoji || '',
      type: type || 'expense',
    },
  })

  // states
  const form = watch()
  const [saving, setSaving] = useState<boolean>(false)
  const [openType, setOpenType] = useState<boolean>(false)

  useEffect(() => {
    setValue('icon', selectedEmoji)
  }, [setValue, selectedEmoji])

  // leave screen
  useEffect(
    () => () => {
      dispatch(setSelectedEmoji(''))
    },
    [dispatch]
  )

  // validate form
  const validate: SubmitHandler<FieldValues> = useCallback(
    data => {
      let isValid = true

      // name is required
      if (!data.name.trim()) {
        setError('name', {
          type: 'manual',
          message: t('Name is required'),
        })
        isValid = false
      }

      return isValid
    },
    [setError, t]
  )

  // create category
  const handleCreateCategory: SubmitHandler<FieldValues> = useCallback(
    async data => {
      // validate form
      if (!validate(data)) return

      // start loading
      setSaving(true)

      try {
        await createCategoryApi({ ...data })

        Toast.show({
          type: 'success',
          text1: tSuccess('Category created'),
        })

        dispatch(refresh())
        router.back()
      } catch (err: any) {
        Toast.show({
          type: 'error',
          text1: tError('Failed to create category'),
        })
        console.log(err)
      } finally {
        // stop loading
        setSaving(false)
      }
    },
    [dispatch, validate, tError, tSuccess]
  )

  return (
    <DrawerWrapper>
      <CommonHeader
        title={
          <>
            {' '}
            {t('Create') + ' '}
            {form.type && <Text className={cn(checkTranType(form.type).color)}>{t(form.type)}</Text>}
            {' ' + t('category')}
          </>
        }
        desc={
          <>
            {t('Categories are used to group your') + ' '}
            {form.type && <Text className={cn(checkTranType(form.type).color)}>{t(form.type)}</Text>}
            {' ' + t('transactions')}
          </>
        }
      />

      <View className="mt-6 flex-col gap-6">
        <CustomInput
          id="name"
          label={t('Name')}
          value={form.name}
          placeholder="..."
          onFocus={() => clearErrors('name')}
          onChange={setValue}
          errors={errors}
          containerClassName="bg-white"
          inputClassName="text-black"
        />

        {/* MARK: Type */}
        {!type && (
          <View className="flex-col gap-1.5">
            <View className="">
              <Text className="px-1 font-semibold text-primary">{t('Type')}</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                className="mt-1.5 h-11 w-full flex-row items-center gap-2 rounded-lg border border-primary bg-white px-3"
                onPress={() => {
                  setOpenType(!openType)
                  clearErrors('type')
                }}
              >
                <Icon
                  render={LucideCircle}
                  size={18}
                  color={checkTranType(form.type).hex}
                />
                <Text
                  className={cn('font-semibold capitalize text-black', checkTranType(form.type).color)}
                >
                  {t(form.type)}
                </Text>
              </TouchableOpacity>
            </View>
            <Collapsible
              collapsed={!openType}
              duration={200}
            >
              <View className="flex-col overflow-hidden rounded-lg">
                {['expense', 'income', 'saving', 'invest'].map(tranType => (
                  <Button
                    variant="default"
                    className="flex-row items-center justify-start gap-2 rounded-none border border-b border-secondary bg-white"
                    onPress={() => {
                      setValue('type', tranType as TransactionType)
                      setOpenType(false)
                    }}
                    key={tranType}
                  >
                    <Icon
                      render={LucideCircle}
                      size={18}
                      color={checkTranType(tranType as any).hex}
                    />
                    <Text
                      className={cn('font-semibold capitalize', checkTranType(tranType as any).color)}
                    >
                      {t(tranType)}
                    </Text>
                  </Button>
                ))}
              </View>
            </Collapsible>
          </View>
        )}

        {/* MARK: Icon */}
        <View>
          <Text className="font-semibold">
            Icon <Text className="font-normal">({t('optional')})</Text>
          </Text>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              router.push('/emoji-picker')
              clearErrors('icon')
            }}
          >
            <ImageBackground
              source={images.preBgVFlip}
              className="mt-1.5 h-[150px] items-center justify-center overflow-hidden rounded-lg border border-primary p-21"
            >
              {form.icon ? (
                <Text style={{ fontSize: 60 }}>{form.icon}</Text>
              ) : (
                <Icon
                  render={LucideCircleOff}
                  size={60}
                  color="#262626"
                  style={{ opacity: 0.7 }}
                />
              )}
            </ImageBackground>
          </TouchableOpacity>

          <Text className="mt-2 text-muted-foreground">
            {t('This is how your category will appear in the app')}
          </Text>
        </View>
      </View>

      {/* MARK: Footer */}
      <CommonFooter
        className="mb-21 mt-6 px-0"
        cancelLabel={t('Cancel')}
        acceptLabel={t('Save')}
        onCancel={router.back}
        onAccept={handleSubmit(handleCreateCategory)}
        loading={saving}
      />

      <Separator className="my-8 h-0" />
    </DrawerWrapper>
  )
}

export default CreateCategoryPage
