import Text from '@/components/Text'
import { useAppSelector } from '@/hooks/reduxHook'
import { adjustCurrency } from '@/lib/string'
import { cn } from '@/lib/utils'
import { LucideEye, LucideEyeOff } from 'lucide-react-native'
import { memo, ReactNode, useCallback, useState } from 'react'
import { Controller, FieldErrors } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { TouchableOpacity, View } from 'react-native'
import { Button } from './ui/button'
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
  // rest
  ...rest
}: InputProps) {
  // store
  const currency = useAppSelector(state => state.settings.settings?.currency)
  const { i18n } = useTranslation()
  const locale = i18n.language

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
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <SelectTrigger
                  className={cn('border', errors[id]?.message ? 'border-rose-500' : 'border-dark')}
                >
                  <SelectValue placeholder={label} />
                </SelectTrigger>
                <SelectContent>
                  {options?.map(option => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      label={option.label}
                    >
                      {option.label}
                    </SelectItem>
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
                  'peer block h-full w-full touch-manipulation appearance-none rounded-lg px-2.5 text-base focus:outline-none focus:ring-0 md:text-sm',
                  errors[id]?.message ? 'border-rose-500' : 'border-dark'
                )}
                editable={!disabled}
                keyboardType="numeric"
                value={adjustCurrency(value || '', locale)}
                onChangeText={text => {
                  const cleanValue = text.replace(/[^0-9]/g, '')
                  onFieldChange(text)
                  if (onChange) onChange(text)
                }}
                placeholder="0"
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
                    'peer block h-full w-full touch-manipulation appearance-none rounded-lg px-2.5 text-base focus:outline-none focus:ring-0 md:text-sm',
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
                  placeholder=""
                  {...rest}
                />
              )}
            />

            {type === 'password' &&
              (isShowPassword ? (
                <TouchableOpacity
                  className="absolute right-0 top-1.5 flex h-full w-9 items-center justify-center"
                  onPress={showPassword}
                >
                  <LucideEye
                    size={20}
                    color="#111"
                  />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  className="absolute right-0 top-1.5 flex h-full w-10 items-center justify-center"
                  onPress={showPassword}
                >
                  <LucideEyeOff
                    size={20}
                    color="#111"
                  />
                </TouchableOpacity>
              ))}
          </>
        )
    }
  }, [])

  return (
    <TouchableOpacity
      className={cn(className)}
      // onPress={onClick}
      // onFocus={onFocus}
    >
      <Label
        htmlFor={id}
        className={cn('ml-1 text-xs font-semibold', labelClassName, errors[id] ? 'text-rose-500' : '')}
      >
        {label}
      </Label>

      <View
        className={cn(
          'relative mt-0.5 flex h-9 rounded-lg',
          errors[id] ? 'border-rose-500' : 'border-dark'
        )}
      >
        {Icon && (
          <Button
            variant="outline"
            className="mr-1 w-9"
          >
            {Icon}
          </Button>
        )}

        {/* Field */}
        {renderField()}
      </View>

      {/* MARK: Error */}
      {errors[id]?.message && (
        <Text className="ml-1 mt-0.5 text-xs text-rose-500 drop-shadow-lg">
          {errors[id]?.message?.toString()}
        </Text>
      )}
    </TouchableOpacity>
  )
}

export default memo(CustomInput)
