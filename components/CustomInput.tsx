import Text from '@/components/Text'
import { currencies } from '@/constants/settings'
import { useAppSelector } from '@/hooks/reduxHook'
import { adjustCurrency } from '@/lib/string'
import { cn } from '@/lib/utils'
import { LucideEye, LucideEyeOff } from 'lucide-react-native'
import { memo, ReactNode, useCallback, useState } from 'react'
import { Controller, FieldErrors } from 'react-hook-form'
import { TouchableOpacity, View } from 'react-native'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

interface InputProps {
  id: string
  type?: string
  label: string
  icon?: ReactNode

  disabled?: boolean
  required?: boolean
  errors: FieldErrors
  options?: any[]
  control: any
  onChange?: (value: string) => void

  className?: string
  labelClassName?: string
  iconClassName?: string
  // rest
  [key: string]: any
}

function CustomInput({
  id,
  type = 'text',
  label,
  icon: Icon,

  disabled,
  required,
  errors,
  options,
  control,
  onChange,

  className,
  labelClassName,
  iconClassName,
  // rest
  ...rest
}: InputProps) {
  // store
  const currency = useAppSelector(state => state.settings.settings?.currency)

  // values
  const locale = currencies.find(c => c.value === currency)?.locale || 'en-US'

  // states
  const [isShowPassword, setIsShowPassword] = useState<boolean>(false)

  // show password
  const showPassword = useCallback(() => {
    setIsShowPassword(prev => !prev)
  }, [])

  const renderField = useCallback(() => {
    switch (type) {
      case 'select':
        return (
          <Controller
            name={id}
            control={control}
            rules={{ required }}
            render={({ field: { onChange: onFieldChange, value } }) => (
              <Select
                onValueChange={(option: any) => {
                  onFieldChange(option.value)
                  if (onChange) onChange(option.value)
                }}
                defaultValue={value}
              >
                <SelectTrigger
                  className={cn(
                    'border',
                    className,
                    errors[id]?.message ? 'border-rose-500' : 'border-dark'
                  )}
                >
                  <SelectValue placeholder={label} />
                </SelectTrigger>
                <SelectContent className=''>
                  {options?.map(option => (
                    <SelectItem value={option.value} label={option.label} key={option.value} />
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        )
      case 'currency':
        return (
          <Controller
            name={id}
            control={control}
            rules={{ required: required ? `${label} is required` : false }}
            render={({ field: { onChange: onFieldChange, value } }) => (
              <Input
                id={id}
                className={cn(
                  'peer block h-full flex-1 touch-manipulation appearance-none rounded-lg px-2.5 text-base focus:outline-none focus:ring-0 md:text-sm',
                  className,
                  errors[id]?.message ? 'border-rose-500' : 'border-dark'
                )}
                editable={!disabled}
                keyboardType='numeric'
                value={adjustCurrency(value || '', locale)}
                onChangeText={text => {
                  onFieldChange(text)
                  if (onChange) onChange(text)
                }}
                placeholder='0'
                {...rest}
              />
            )}
          />
        )
      default:
        return (
          <>
            <Controller
              control={control}
              name={id}
              rules={{ required: required ? `${label} is required` : false }}
              render={({ field: { onChange: onFieldChange, value } }) => (
                <Input
                  id={id}
                  className={cn(
                    'peer block h-full flex-1 touch-manipulation appearance-none rounded-lg px-2.5 text-base focus:outline-none focus:ring-0 md:text-sm',
                    className,
                    errors[id]?.message ? 'border-rose-500' : 'border-dark',
                    type === 'password' ? 'pr-10' : ''
                  )}
                  editable={disabled}
                  secureTextEntry={type === 'password' && !isShowPassword}
                  value={value || ''}
                  onChangeText={text => {
                    onFieldChange(text)
                    if (onChange) onChange(text)
                  }}
                  placeholder=''
                  {...rest}
                />
              )}
            />

            {type === 'password' && (
              <View className='absolute right-2 top-1/2 -translate-y-1/2'>
                <TouchableOpacity onPress={showPassword}>
                  {isShowPassword ? (
                    <LucideEye size={20} color='#111' />
                  ) : (
                    <LucideEyeOff size={20} color='#111' />
                  )}
                </TouchableOpacity>
              </View>
            )}
          </>
        )
    }
  }, [
    control,
    errors,
    id,
    isShowPassword,
    label,
    locale,
    onChange,
    options,
    required,
    rest,
    showPassword,
    type,
  ])

  return (
    <View>
      <Label
        htmlFor={id}
        className={cn('ml-1 font-semibold', labelClassName, errors[id] ? 'text-rose-500' : '')}
      >
        {label}
      </Label>

      <View
        className={cn(
          'relative mt-2 flex h-9 flex-row items-center gap-1 rounded-lg',
          errors[id] ? 'border-rose-500' : 'border-dark'
        )}
      >
        {Icon && (
          <View
            className={cn(
              'flex flex-row items-center justify-center rounded-lg border bg-primary',
              iconClassName
            )}
            style={{ height: 42, width: 42 }}
          >
            {Icon}
          </View>
        )}

        {/* Field */}
        {renderField()}
      </View>

      {/* MARK: Error */}
      {errors[id]?.message && (
        <Text className='mt ml-1 mt-4 text-sm text-rose-500 drop-shadow-lg'>
          {errors[id]?.message?.toString()}
        </Text>
      )}
    </View>
  )
}

export default memo(CustomInput)
