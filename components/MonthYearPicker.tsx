import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { capitalize, getLocale } from '@/lib/string'
import { format } from 'date-fns'
import { LucideCalendarFold, LucideChevronDown } from 'lucide-react-native'
import { memo, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, View } from 'react-native'
import BlurView from './BlurView'
import Icon from './Icon'
import Text from './Text'

interface MonthYearPickerProps {
  currentMonth: Date
  setCurrentMonth: (date: Date) => void
}

function MonthYearPicker({ currentMonth, setCurrentMonth }: MonthYearPickerProps) {
  // hooks
  const { t: translate, i18n } = useTranslation()
  const t = (key: string) => translate('monthYearPicker.' + key)
  const locale = i18n.language

  // states
  const [newMonth, setNewMonth] = useState<number>(currentMonth.getMonth())
  const [newYear, setNewYear] = useState<number>(currentMonth.getFullYear())

  useEffect(() => {
    setNewMonth(currentMonth.getMonth())
    setNewYear(currentMonth.getFullYear())
  }, [currentMonth])

  // Helper function to get month names based on locale
  const getMonthNames = (locale: string) => {
    const months = []
    for (let i = 0; i < 12; i++) {
      const date = new Date(2021, i, 1)
      months.push({
        value: i.toString(),
        label: format(date, 'MMMM', { locale: getLocale(locale) }),
      })
    }
    return months
  }

  const handleApply = useCallback(() => {
    const newY = Math.min(Math.max(newYear, 1900), 2100)
    setNewYear(newY)

    const newDate = new Date(newY, newMonth)
    setCurrentMonth(newDate)
  }, [newMonth, newYear, setCurrentMonth])

  return (
    <Popover>
      {/* MARK: Trigger */}
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="flex-row items-center gap-2 bg-primary-foreground py-0"
        >
          <Icon
            render={LucideCalendarFold}
            size={20}
          />
          <Text className="font-semibold capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: getLocale(locale) })}
          </Text>
          <Icon
            render={LucideChevronDown}
            size={20}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="max-w-sm bg-transparent p-0"
        align="start"
      >
        <BlurView
          className="gap-4 overflow-hidden rounded-xl p-4"
          intensity={80}
          noBlur
        >
          {/* MARK: Month */}
          <View className="flex-col gap-2">
            <Text className="text-sm font-medium">{t('Month')}</Text>
            <Select
              value={{
                value: newMonth.toString(),
                label: capitalize(getMonthNames(locale)[newMonth].label),
              }}
              onValueChange={option => {
                if (option) {
                  setNewMonth(+option.value)
                }
              }}
            >
              <SelectTrigger className="capitalize">
                <SelectValue
                  className="text-lg text-primary"
                  placeholder="Select month"
                />
              </SelectTrigger>
              <SelectContent>
                <ScrollView>
                  {getMonthNames(locale).map(month => (
                    <SelectItem
                      value={month.value}
                      label={month.label}
                      className="capitalize"
                      key={month.value}
                    />
                  ))}
                </ScrollView>
              </SelectContent>
            </Select>
          </View>

          {/* MARK: Year */}
          <View className="flex-col gap-2">
            <Text className="font-medium">{t('Year')}</Text>
            <Input
              keyboardType="numeric"
              value={newYear.toString()}
              onChangeText={value => setNewYear(+value)}
              maxLength={4}
            />
          </View>
          <Button
            variant="default"
            onPress={handleApply}
          >
            <Text className="font-semibold text-secondary">{t('Apply')}</Text>
          </Button>
        </BlurView>
      </PopoverContent>
    </Popover>
  )
}

export default memo(MonthYearPicker)
