import { useAppSelector } from '@/hooks/reduxHook'
import { checkTranType, formatCompactNumber, formatCurrency } from '@/lib/string'
import { cn } from '@/lib/utils'
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet'
import { memo, useCallback, useState } from 'react'
import { View } from 'react-native'
import { BarChart, LineChart, PieChart } from 'react-native-gifted-charts'
import Text from './Text'

interface ChartProps {
  data: ChartItem[]
  chartType: ChartType
  transactionType: TransactionType
  className?: string
}

const colors: any = {
  balance: [checkTranType('balance').hex, '#2563eb'],
  income: [checkTranType('income').hex, '#16a34a'],
  expense: [checkTranType('expense').hex, '#e11d48'],
  saving: [checkTranType('saving').hex, '#ca8a04'],
  invest: [checkTranType('invest').hex, '#4f46e5'],
}

function Chart({ data, chartType, transactionType, className }: ChartProps) {
  const currency = useAppSelector(state => state.settings.settings?.currency)
  const [selected, setSelected] = useState<number | null>(null)

  // normalize values to avoid large amplitude in the chart
  function normalizeValues(data: ChartItem[]) {
    const max = Math.max(...data.map(d => Math.abs(d.value)))
    const threshold = max * 0.05 // 5% of the max value

    return data.map(d => {
      const raw = Math.abs(d.value)
      const normalizedValue = raw < threshold && raw > 0 ? threshold + (raw / max) * 100 : raw

      return {
        ...d,
        value: normalizedValue,
        originalValue: d.value,
      }
    })
  }

  const renderChart = useCallback(() => {
    if (!currency) return

    const chartWidth = SCREEN_WIDTH - 56
    const chartHeight = 250
    const threshold = Math.max(...data.map(d => Math.abs(d.value))) * 0.95

    switch (chartType) {
      case 'line':
        return (
          <LineChart
            data={data}
            //
            height={chartHeight}
            width={chartWidth}
            //
            spacing={40}
            noOfSections={4}
            //
            yAxisThickness={0}
            xAxisThickness={0}
            xAxisLabelTextStyle={{ color: 'gray' }}
            yAxisTextStyle={{ color: 'gray' }}
            //
            color={colors[transactionType][0]}
            startFillColor={colors[transactionType][0]}
            endFillColor={colors[transactionType][1]}
            dataPointsRadius={3}
            dataPointsColor="white"
            //
            areaChart
            curved
            //
            isAnimated
            animationDuration={700}
          />
        )
      case 'pie': {
        const pieData = data.map(datum => ({
          // label: datum.label,
          value: Math.abs(datum.value),
          color: colors[datum.type][0],
          text: formatCompactNumber(datum.value),
        }))
        const totalValue = data.reduce((sum, item) => sum + item.value, 0)

        return (
          <View className="mt-2 flex-row items-center justify-center">
            <PieChart
              data={pieData}
              //
              radius={Math.min(chartWidth / 2.3, 250)}
              donut
              //
              showText
              textColor="white"
              textSize={16}
              textBackgroundRadius={24}
              centerLabelComponent={() => (
                <Text
                  className={cn(
                    'text-center font-body text-xl font-bold tracking-wider',
                    checkTranType(transactionType).color
                  )}
                >
                  {formatCurrency(currency, Math.abs(totalValue))}
                </Text>
              )}
              //
              focusOnPress
              isAnimated
              animationDuration={700}
            />
          </View>
        )
      }

      default:
        return (
          <BarChart
            data={normalizeValues(data)}
            //
            barWidth={18}
            height={chartHeight}
            width={chartWidth}
            minHeight={3}
            //
            spacing={21}
            barBorderRadius={3}
            initialSpacing={8}
            frontColor={colors[transactionType][0]}
            noOfSections={5}
            yAxisThickness={0}
            xAxisThickness={0}
            xAxisLabelTextStyle={{ color: 'gray' }}
            yAxisTextStyle={{ color: 'gray' }}
            //
            isAnimated
            animationDuration={200}
            // tooltip
            onPress={(_: any, index: number) => setSelected(index === selected ? null : index)}
            renderTooltip={(item: any, index: number) => {
              const isTooHigh = item.value >= threshold

              return (
                index === selected && (
                  <View
                    className="absolute rounded-md bg-primary px-2 py-1"
                    style={{ bottom: isTooHigh ? -30 : undefined, top: isTooHigh ? undefined : -30 }}
                  >
                    <Text className="font-body text-sm font-medium tracking-wider text-secondary">
                      {formatCurrency(currency, item.originalValue ?? item.value)}
                    </Text>
                  </View>
                )
              )
            }}
          />
        )
    }
  }, [data, chartType, transactionType, currency, selected])

  return <View className={cn('overflow-hidden', className)}>{renderChart()}</View>
}

export default memo(Chart)
