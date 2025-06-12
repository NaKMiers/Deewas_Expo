import { languages } from '@/constants/settings'
import useLanguage from '@/hooks/useLanguage'
import { cn } from '@/lib/utils'
import React, { memo } from 'react'
import { ScrollView, View } from 'react-native'
import Text from './Text'
import { Select, SelectContent, SelectItem, SelectTrigger } from './ui/select'

function LanguageSelector({ className }: { className?: string }) {
  const { changeLanguage, language } = useLanguage()

  return (
    <View className={cn('flex-row items-center justify-end px-21/2 py-21/2 md:px-21', className)}>
      <Select
        value={language}
        onValueChange={option => {
          if (!option) return
          changeLanguage(option.value)
        }}
      >
        <SelectTrigger
          className="border-transparent bg-transparent"
          style={{ height: 36 }}
        >
          <Text>{language.label}</Text>
        </SelectTrigger>

        <SelectContent className="border-transparent bg-secondary shadow-none">
          <ScrollView>
            {languages.map((item, index) => (
              <SelectItem
                value={item.value}
                label={item.label}
                key={index}
              />
            ))}
          </ScrollView>
        </SelectContent>
      </Select>
    </View>
  )
}

export default memo(LanguageSelector)
