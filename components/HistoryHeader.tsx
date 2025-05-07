import { capitalize } from '@/lib/string'
import { cn } from '@/lib/utils'
import SegmentedControl from '@react-native-segmented-control/segmented-control'
import { router } from 'expo-router'
import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import PremiumLimitModal from './dialogs/PremiumLimitModal'
import { useAuth } from './providers/AuthProvider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

interface HistoryHeaderProps {
  charts: ChartType[]
  segments: string[]
  segment: string
  onChangeSegment: (segment: string) => void
  selected: string
  onSelect: (value: string) => void
  className?: string
}

function HistoryHeader({
  charts,
  segments,
  segment,
  onChangeSegment,
  selected,
  onSelect,
  className,
}: HistoryHeaderProps) {
  // hooks
  const { isPremium } = useAuth()
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('history.' + key)

  const [openPremiumModal, setOpenPremiumModal] = useState<boolean>(false)

  return (
    <>
      <View className={cn('flex-row items-center justify-between gap-21/2 md:gap-21', className)}>
        <SegmentedControl
          values={segments.map(s => capitalize(t(s)))}
          style={{ width: '100%', height: 34, flex: 1 }}
          selectedIndex={segments.indexOf(segment)}
          onChange={event => {
            const index = event.nativeEvent.selectedSegmentIndex
            onChangeSegment(segments[index])
          }}
        />
        <Select
          value={{ label: t(selected), value: selected }}
          onValueChange={option => {
            if (!isPremium) {
              setOpenPremiumModal(true)
              return
            }
            onSelect(option?.value || t(selected))
          }}
        >
          <SelectTrigger
            className="h-10 flex-row items-center justify-center rounded-xl shadow-md"
            style={{ height: 36 }}
          >
            <SelectValue
              placeholder="Select Chart"
              className="font-semibold capitalize text-primary"
            />
          </SelectTrigger>
          <SelectContent className="mt-1 shadow-none">
            {charts.map(chart => (
              <SelectItem
                value={chart}
                label={capitalize(t(chart))}
                key={chart}
              />
            ))}
          </SelectContent>
        </Select>
      </View>

      <PremiumLimitModal
        open={openPremiumModal}
        close={() => setOpenPremiumModal(false)}
        label={t('Please upgrade to Premium to unlock more charts')}
        confirmLabel={t('Upgrade Now')}
        cancelLabel={t('Cancel')}
        onConfirm={() => router.push('/premium')}
      />
    </>
  )
}

export default memo(HistoryHeader)
