import { checkTranType } from '@/lib/string'
import { cn } from '@/lib/utils'
import { useCallback } from 'react'
import { View } from 'react-native'
import { BarChart, LineChart, PieChart, PopulationPyramid, RadarChart } from 'react-native-gifted-charts'

interface ChartProps {
  data: ChartItem[]
  chartType: ChartType
  transactionType: TransactionType
  className?: string
}

const colors: any = {
  income: [checkTranType('income').hex, '#7c3aed'],
  expense: [checkTranType('expense').hex, '#ea580c'],
  balance: [checkTranType('balance').hex, '#dc2626'],
  saving: [checkTranType('saving').hex, '#7c3aed'],
  invest: [checkTranType('invest').hex, '#7c3aed'],
}

export default function Chart({ data, chartType, transactionType, className }: ChartProps) {
  const renderChart = useCallback(() => {
    switch (chartType) {
      case 'bar':
        return (
          <BarChart
            data={data}
            barWidth={18}
            height={200}
            // width={290}
            minHeight={3}
            barBorderRadius={3}
            showGradient
            frontColor={colors[transactionType][0]}
            gradientColor={colors[transactionType][1]}
            spacing={21}
            noOfSections={4}
            yAxisThickness={0}
            xAxisThickness={0}
            xAxisLabelsVerticalShift={2}
            xAxisLabelTextStyle={{ color: 'gray' }}
            yAxisTextStyle={{ color: 'gray' }}
          />
        )
      case 'line':
        return <LineChart data={data} />
      case 'pie':
        return <PieChart data={[{ value: 50, color: '#FF6384' }]} />
      case 'pyramid':
        return (
          <PopulationPyramid
            data={[
              { left: 10, right: 12 },
              { left: 9, right: 8 },
            ]}
          />
        )
      case 'radar':
        return <RadarChart data={[50, 80, 90, 70]} />
      default:
        return null
    }
  }, [data, chartType, transactionType])

  return <View className={cn('overflow-hidden', className)}>{renderChart()}</View>
}
