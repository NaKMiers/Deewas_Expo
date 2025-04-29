import Text from '@/components/Text'
import { cn } from '@/lib/utils'
import { LucideEye, LucideEyeOff } from 'lucide-react-native'
import { memo, ReactNode, useCallback, useState } from 'react'
import { FieldErrors } from 'react-hook-form'
import { TouchableOpacity, View } from 'react-native'
import { Input } from './ui/input'

interface InputProps {
  id: string
  type?: string
  value: string
  label: string
  icon?: ReactNode
  placeholder?: string

  onChange: (id: string, value: string) => void
  disabled?: boolean
  required?: boolean
  errors: FieldErrors

  containerClassName?: string
  labelClassName?: string
  iconClassName?: string
  inputClassName?: string

  [key: string]: any
}

function CustomInput({
  id,
  type = 'text',
  value,
  label,
  icon: Icon,
  placeholder,

  onChange,
  disabled,
  errors,

  containerClassName,
  labelClassName,
  iconClassName,
  inputClassName,
}: InputProps) {
  // states
  const [showPW, setShowPW] = useState<boolean>(false)

  // show password
  const showPassword = useCallback(() => {
    setShowPW(prev => !prev)
  }, [])

  return (
    <View>
      {/* Label */}
      <Text className={cn('ml-1 font-semibold', labelClassName, errors[id] ? 'text-rose-500' : '')}>
        {label}
      </Text>

      <View
        className={cn(
          'relative mt-1.5 h-12 w-full flex-row items-center rounded-lg bg-primary shadow-lg',
          containerClassName,
          errors[id] ? 'border border-rose-500' : 'border-dark border'
        )}
      >
        {/* Icon */}
        {Icon && (
          <View
            className={cn(
              'h-12 w-12 items-center justify-center rounded-l-lg border-r border-primary',
              iconClassName
            )}
          >
            {Icon}
          </View>
        )}

        {/* Field */}
        <Input
          id={id}
          className={cn(
            'h-full w-full flex-1 rounded-lg border-0 bg-transparent px-21/2 text-secondary',
            inputClassName,
            type === 'password' ? 'pr-10' : ''
          )}
          value={value}
          keyboardType={type === 'number' ? 'decimal-pad' : 'default'}
          editable={disabled}
          secureTextEntry={type === 'password' && !showPW}
          placeholder={placeholder}
          onChangeText={text => onChange(id, text)}
        />

        {type === 'password' && (
          <View className="absolute right-21/2 top-1/2 -translate-y-1/2">
            <TouchableOpacity onPress={showPassword}>
              {showPW ? (
                <LucideEye
                  size={20}
                  color="#111"
                />
              ) : (
                <LucideEyeOff
                  size={20}
                  color="#111"
                />
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* MARK: Error */}
      {errors[id]?.message && (
        <Text className="mt ml-1 mt-0.5 text-rose-500 drop-shadow-lg">
          {errors[id]?.message?.toString()}
        </Text>
      )}
    </View>
  )
}

export default memo(CustomInput)
