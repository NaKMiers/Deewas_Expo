import { useAppSelector } from '@/hooks/reduxHook'
import { checkTranType, formatCompactNumber, formatCurrency } from '@/lib/string'
import { cn } from '@/lib/utils'
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet'
import { memo, useCallback } from 'react'
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

  const renderChart = useCallback(() => {
    if (!currency) return

    const chartWidth = SCREEN_WIDTH - 42

    switch (chartType) {
      case 'line':
        return (
          <LineChart
            data={data}
            //
            height={200}
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
          <View className="mt-2 flex flex-row items-center justify-center">
            <PieChart
              data={pieData}
              //
              radius={Math.min(chartWidth / 2.5, 200)}
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
            data={data}
            //
            barWidth={18}
            height={200}
            width={chartWidth}
            minHeight={3}
            //
            spacing={21}
            barBorderRadius={3}
            initialSpacing={8}
            //
            // showGradient
            frontColor={colors[transactionType][0]}
            // gradientColor={colors[transactionType][1]}
            //
            noOfSections={4}
            yAxisThickness={0}
            xAxisThickness={0}
            xAxisLabelTextStyle={{ color: 'gray' }}
            yAxisTextStyle={{ color: 'gray' }}
            //
            isAnimated
            animationDuration={200}
          />
        )
    }
  }, [data, chartType, transactionType, currency])

  return <View className={cn('overflow-hidden', className)}>{renderChart()}</View>
}

export default memo(Chart)
