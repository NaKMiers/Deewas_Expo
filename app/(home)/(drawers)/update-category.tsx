import { images } from '@/assets/images/images'
import CustomInput from '@/components/CustomInput'
import CommonFooter from '@/components/dialogs/CommonFooter'
import DrawerWrapper from '@/components/DrawerWrapper'
import Icon from '@/components/Icon'
import Text from '@/components/Text'
import { Separator } from '@/components/ui/separator'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { refresh } from '@/lib/reducers/loadReducer'
import { setCategoryToEdit, setSelectedEmoji } from '@/lib/reducers/screenReducer'
import { checkTranType } from '@/lib/string'
import { cn } from '@/lib/utils'
import { updateCategoryApi } from '@/requests/categoryRequests'
import { router } from 'expo-router'
import { LucideCircleOff } from 'lucide-react-native'
import { useCallback, useEffect, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { ImageBackground, TouchableOpacity, View } from 'react-native'
import Toast from 'react-native-toast-message'

function UpdateCategoryPage() {
  // hooks
  const { t: translate } = useTranslation()
  const t = useCallback((key: string) => translate('updateCategoryPage.' + key), [translate])
  const tSuccess = useCallback((key: string) => translate('success.' + key), [translate])
  const tError = useCallback((key: string) => translate('error.' + key), [translate])
  const dispatch = useAppDispatch()

  // store
  const { categoryToEdit: category, selectedEmoji } = useAppSelector(state => state.screen)

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
      name: category?.name || '',
      icon: category?.icon || '',
    },
  })

  // states
  const form = watch()
  const [saving, setSaving] = useState<boolean>(false)

  useEffect(() => {
    setValue('icon', selectedEmoji || category?.icon || '')
  }, [setValue, selectedEmoji, category])

  // leave screen
  useEffect(
    () => () => {
      dispatch(setSelectedEmoji(''))
      dispatch(setCategoryToEdit(null))
    },
    [dispatch]
  )

  // check change
  const checkChanged = useCallback(
    (newValues: any) => {
      if (!category || !newValues) return false

      if (category.name !== newValues.name) return true
      if (category.icon !== newValues.icon) return true

      return false
    },
    [category]
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

      if (!checkChanged(data)) {
        dispatch(setCategoryToEdit(null))
        router.back()
        return false
      }

      return isValid
    },
    [dispatch, setError, checkChanged, t]
  )

  // update category
  const handleUpdateCategory: SubmitHandler<FieldValues> = useCallback(
    async data => {
      // validate form
      if (!category) return
      if (!validate(data)) return

      // start loading
      setSaving(true)

      try {
        await updateCategoryApi(category._id, { ...data })

        Toast.show({
          type: 'success',
          text1: tSuccess('Category updated'),
        })

        dispatch(refresh())
        router.back()
      } catch (err: any) {
        Toast.show({
          type: 'error',
          text1: tError('Failed to update category'),
        })
        console.log(err)
      } finally {
        // stop loading
        setSaving(false)
      }
    },
    [dispatch, validate, tError, tSuccess, category]
  )

  return (
    <DrawerWrapper>
      <View>
        <Text className="text-center text-xl font-semibold text-primary">
          {t('Update') + ' '}
          {category?.type && (
            <Text className={cn(checkTranType(category.type).color)}>{t(category.type)}</Text>
          )}
          {' ' + t('category')}
        </Text>
        <Text className="text-center tracking-wider text-muted-foreground">
          {t('Categories are used to group your') + ' '}
          {category?.type && (
            <Text className={cn(checkTranType(category.type).color)}>{t(category.type)}</Text>
          )}
          {' ' + t('transactions')}
        </Text>
      </View>

      <View className="mt-6 flex-col gap-6">
        {/* MARK: Name */}
        <CustomInput
          id="name"
          label={t('Name')}
          value={form.name}
          placeholder="..."
          onChange={setValue}
          onFocus={() => clearErrors('name')}
          errors={errors}
          containerClassName="bg-white"
          inputClassName="text-black"
        />

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

      <CommonFooter
        className="mb-21 mt-6 px-0"
        cancelLabel={t('Cancel')}
        acceptLabel={t('Save')}
        onCancel={router.back}
        onAccept={handleSubmit(handleUpdateCategory)}
        loading={saving}
      />

      <Separator className="my-8 h-0" />
    </DrawerWrapper>
  )
}

export default UpdateCategoryPage
