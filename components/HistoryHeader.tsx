import { capitalize } from '@/lib/string'
import { cn } from '@/lib/utils'
import SegmentedControl from '@react-native-segmented-control/segmented-control'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
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
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('history.' + key)

  return (
    <View className={cn('flex flex-row items-center justify-between gap-21/2 md:gap-21', className)}>
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
        onValueChange={option => onSelect(option?.value || t(selected))}
      >
        <SelectTrigger
          className="flex h-10 flex-row items-center justify-center rounded-xl shadow-md"
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
  )
}

export default HistoryHeader
