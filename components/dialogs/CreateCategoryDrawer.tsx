import { checkTranType } from '@/lib/string'
import { cn } from '@/lib/utils'
import { createCategoryApi } from '@/requests/categoryRequests'
import { TouchableWithoutFeedback } from '@gorhom/bottom-sheet'
import { LucideCircle, LucideCircleOff } from 'lucide-react-native'
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'
import { Separator } from '../ui/separator'

interface CreateCategoryDrawerProps {
  type?: TransactionType
  update?: (category: ICategory) => void
  load?: Dispatch<SetStateAction<boolean>>
  className?: string
}

function CreateCategoryDrawer({ type, update, load, className }: CreateCategoryDrawerProps) {
  // hooks
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('createCategoryDrawer.' + key)
  const tSuccess = (key: string) => translate('success.' + key)
  const tError = (key: string) => translate('error.' + key)
  const { closeDrawer3 } = useDrawer()

  // form
  const {
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    control,
    clearErrors,
    watch,
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      name: '',
      icon: '',
      type: type || 'expense',
    },
  })

  // states
  const form = watch()
  const [openEmojiPicker, setOpenEmojiPicker] = useState<boolean>(false)
  const [saving, setSaving] = useState<boolean>(false)
  const [openType, setOpenType] = useState<boolean>(false)

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

  // create category
  const handleCreateCategory: SubmitHandler<FieldValues> = useCallback(
    async data => {
      // validate form
      if (!handleValidate(data)) return

      // start loading
      setSaving(true)
      if (load) {
        load(true)
      }

      try {
        const { category, message } = await createCategoryApi({ ...data })

        if (update) {
          update(category)
        }

        Toast.show({
          type: 'success',
          text1: tSuccess('Category created'),
        })

        reset()
        closeDrawer3()
      } catch (err: any) {
        Toast.show({
          type: 'error',
          text1: tError('Failed to create category'),
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
    [handleValidate, load, reset, update, t]
  )

  return (
    <View className={cn('mx-auto mt-21 w-full max-w-sm', className)}>
      <View>
        <Text className="text-center text-xl font-semibold text-primary">
          {t('Create') + ' '}
          {form.type && <Text className={cn(checkTranType(form.type).color)}>{t(form.type)}</Text>}
          {' ' + t('category')}
        </Text>
        <Text className="text-center text-muted-foreground">
          {t('Categories are used to group your') + ' '}
          {form.type && <Text className={cn(checkTranType(form.type).color)}>{t(form.type)}</Text>}
          {' ' + t('transactions')}
        </Text>
      </View>

      <View className="mt-6 flex flex-col gap-6">
        <CustomInput
          id="name"
          label={t('Name')}
          type="text"
          control={control}
          errors={errors}
          className="bg-white text-black"
          placeholder={t('Category name') + '...'}
          onFocus={() => clearErrors('name')}
        />

        {/* MARK: Type */}
        {!type && (
          <Collapsible
            open={openType}
            onOpenChange={setOpenType}
          >
            <CollapsibleTrigger>
              <Text className="px-1 font-semibold text-primary">Type</Text>
              <View className="mt-2 flex h-11 w-full flex-row items-center gap-2 rounded-lg border border-primary bg-white px-3">
                <Icon
                  render={LucideCircle}
                  size={18}
                  color={checkTranType(form.type).hex}
                />
                <Text
                  className={cn('font-semibold capitalize text-black', checkTranType(form.type).color)}
                >
                  {form.type}
                </Text>
              </View>
            </CollapsibleTrigger>
            <CollapsibleContent className="overflow-hidden rounded-lg">
              {['expense', 'income', 'saving', 'invest'].map(tranType => (
                <Button
                  variant="default"
                  className="flex flex-row items-center justify-start gap-2 rounded-none border border-b border-secondary bg-white"
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
                  <Text className={cn('font-semibold capitalize', checkTranType(tranType as any).color)}>
                    {t(tranType)}
                  </Text>
                </Button>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}

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
            onPress={handleSubmit(handleCreateCategory)}
          >
            {saving ? <ActivityIndicator /> : <Text className="font-semibold">{t('Save')}</Text>}
          </Button>
        </View>
      </View>

      <Separator className="my-8 h-0" />
    </View>
  )
}

interface NodeProps extends CreateCategoryDrawerProps {
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
      onPress={() => openDrawer3(<CreateCategoryDrawer {...props} />)}
    >
      {trigger}
    </TouchableOpacity>
  )
}

export default Node
