import { checkTranType } from '@/lib/string'
import { cn } from '@/lib/utils'
import { updateCategoryApi } from '@/requests/categoryRequests'
import { ICategory } from '@/types/type'
import { TouchableWithoutFeedback } from '@gorhom/bottom-sheet'
import { LucideCircleOff } from 'lucide-react'
import { Dispatch, ReactNode, SetStateAction, useCallback, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, Modal, SafeAreaView, TouchableOpacity, View } from 'react-native'
import EmojiSelector from 'react-native-emoji-selector'
import Toast from 'react-native-toast-message'
import CustomInput from '../CustomInput'
import Icon from '../Icon'
import { useDrawer } from '../providers/DrawerProvider'
import Text from '../Text'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'

interface UpdateCategoryDrawerProps {
  category: ICategory
  update?: (category: ICategory) => void
  load?: Dispatch<SetStateAction<boolean>>
  className?: string
}

function UpdateCategoryDrawer({ category, update, load, className }: UpdateCategoryDrawerProps) {
  // hooks
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('updateCategoryDrawer.' + key)
  const tSuccess = (key: string) => translate('success.' + key)
  const tError = (key: string) => translate('error.' + key)
  const { closeDrawer3 } = useDrawer()

  // form
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    clearErrors,
    watch,
    reset,
    control,
  } = useForm<FieldValues>({
    defaultValues: {
      name: category.name || '',
      icon: category.icon || '',
    },
  })

  // states
  const form = watch()
  const [openEmojiPicker, setOpenEmojiPicker] = useState<boolean>(false)
  const [saving, setSaving] = useState<boolean>(false)

  // validate form
  const handleValidate: SubmitHandler<FieldValues> = useCallback(
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

  // update category
  const handleUpdateCategory: SubmitHandler<FieldValues> = useCallback(
    async data => {
      // validate form
      if (!handleValidate(data)) return
      // start loading
      setSaving(true)
      if (load) {
        load(true)
      }

      try {
        const { category: c, message } = await updateCategoryApi(category._id, { ...data })
        if (update) update(c)

        Toast.show({
          type: 'success',
          text1: tSuccess('Category updated'),
        })

        reset()
        closeDrawer3()
      } catch (err: any) {
        Toast.show({
          type: 'error',
          text1: tError('Failed to update category'),
        })
        console.log(err)
      } finally {
        // stop loading
        setSaving(false)
        if (load) {
          load(false)
        }
      }
    },
    [handleValidate, load, reset, update, category._id, t]
  )

  return (
    <View className={cn('mx-auto mt-21 w-full max-w-sm', className)}>
      <View>
        <Text className="text-center text-xl font-semibold text-primary">
          {t('Update') + ' '}
          {category.type && (
            <Text className={cn(checkTranType(category.type).color)}>{t(category.type)}</Text>
          )}
          {' ' + t('category')}
        </Text>
        <Text className="text-center text-muted-foreground">
          {t('Categories are used to group your') + ' '}
          {category.type && (
            <Text className={cn(checkTranType(category.type).color)}>{t(category.type)}</Text>
          )}
          {' ' + t('transactions')}
        </Text>
      </View>

      {/* MARK: Icon */}
      <View className="mt-6 flex flex-col gap-6">
        <CustomInput
          id="name"
          label={t('Name')}
          type="text"
          control={control}
          errors={errors}
          className="bg-white text-black"
          onFocus={() => clearErrors('name')}
        />

        {/* MARK: Icon */}
        <View>
          <Text className="font-semibold">
            Icon <Text className="font-normal">({t('optional')})</Text>
          </Text>

          <TouchableWithoutFeedback onPress={() => setOpenEmojiPicker(true)}>
            <View className="mt-2 flex h-[200px] items-center justify-center rounded-lg border border-secondary p-21">
              {form.icon ? (
                <Text style={{ fontSize: 60 }}>{form.icon}</Text>
              ) : (
                <Icon
                  render={LucideCircleOff}
                  size={60}
                  style={{ opacity: 0.7 }}
                />
              )}
            </View>
          </TouchableWithoutFeedback>

          <Modal
            visible={openEmojiPicker}
            animationType="slide"
            onTouchCancel={() => setOpenEmojiPicker(false)}
            onDismiss={() => setOpenEmojiPicker(false)}
          >
            <SafeAreaView className="flex-1">
              <View className="mx-auto flex max-w-[500px] flex-1 flex-col gap-2 p-21">
                <View className="w-full flex-1">
                  <EmojiSelector
                    columns={8}
                    placeholder="Pick an emoji..."
                    onEmojiSelected={emoji => {
                      setValue('icon', emoji)
                      setOpenEmojiPicker(false)
                    }}
                  />
                </View>

                <View className="flex flex-shrink-0 flex-row items-center justify-end gap-2 bg-white py-2">
                  <Button
                    variant="secondary"
                    onPress={() => {
                      setOpenEmojiPicker(false)
                      setValue('icon', '')
                    }}
                  >
                    <Text className="font-semibold">Cancel</Text>
                  </Button>
                  <Button
                    variant="default"
                    className="border"
                    onPress={() => setOpenEmojiPicker(false)}
                  >
                    <Text className="font-semibold text-secondary">Confirm</Text>
                  </Button>
                </View>
              </View>
            </SafeAreaView>
          </Modal>

          <Text className="mt-2 text-muted-foreground">
            {t('This is how your category will appear in the app')}
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View className="mb-21 mt-6 px-0">
        <View className="mt-3 flex flex-row items-center justify-end gap-21/2">
          <View>
            <Button
              variant="default"
              className="h-10 rounded-md px-21/2"
              onPress={() => {
                reset()
                closeDrawer3()
              }}
            >
              <Text className="font-semibold text-secondary">{t('Cancel')}</Text>
            </Button>
          </View>
          <Button
            variant="secondary"
            className="h-10 min-w-[60px] rounded-md px-21/2"
            onPress={handleSubmit(handleUpdateCategory)}
          >
            {saving ? <ActivityIndicator /> : <Text className="font-semibold">{t('Save')}</Text>}
          </Button>
        </View>
      </View>

      <Separator className="my-8 h-0" />
    </View>
  )
}

interface NodeProps extends UpdateCategoryDrawerProps {
  disabled?: boolean
  trigger: ReactNode
  className?: string
}

function Node({ disabled, trigger, className, ...props }: NodeProps) {
  const { openDrawer3 } = useDrawer()

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      className={cn(className, disabled && 'opacity-50')}
      disabled={disabled}
      onPress={() => openDrawer3(<UpdateCategoryDrawer {...props} />)}
    >
      {trigger}
    </TouchableOpacity>
  )
}

export default Node
