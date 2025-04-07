import { useAppSelector } from '@/hooks/reduxHook'
import { capitalize, checkTranType, formatCurrency } from '@/lib/string'
import { useColorScheme } from '@/lib/useColorScheme'
import { TransactionType } from '@/types/type'
import React, { memo, useCallback } from 'react'
import { Dimensions, View } from 'react-native'
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit'

export type ChartDatum = {
  name: string
  income: number
  expense: number
  balance: number
  saving: number
  invest: number
}

interface ChartProps {
  chart: string
  types: TransactionType[]
  data: any[]
  className?: string
  maxKey: string
}

const screenWidth = Dimensions.get('window').width

function Chart({ maxKey, types, chart, data = [], className }: ChartProps) {
  const { isDarkColorScheme } = useColorScheme()
  const currency = useAppSelector(state => state.settings.settings?.currency)

  const formatTooltip = useCallback(
    (value: number, name: string) => {
      const formattedValue = currency ? formatCurrency(currency, value) : '0'
      return `${capitalize(name)}: ${formattedValue}`
    },
    [currency]
  )

  const chartConfig = {
    backgroundGradientFrom: isDarkColorScheme ? '#171717' : '#fff',
    backgroundGradientTo: isDarkColorScheme ? '#171717' : '#fff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Màu mặc định
    labelColor: (opacity = 1) => (isDarkColorScheme ? '#fff' : '#333'),
    style: {
      borderRadius: 8,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '1',
    },
  }

  const renderChart = useCallback(() => {
    const chartData = {
      labels: data.map(item => item.name),
      datasets: types.map(type => ({
        data: data.map(item => item[type] || 0),
        color: () => checkTranType(type).hex,
      })),
    }

    switch (chart) {
      case 'bar':
        return (
          <BarChart
            data={chartData}
            width={screenWidth - 40}
            height={380}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={{
              ...chartConfig,
              barPercentage: 0.5,
            }}
            fromZero
          />
        )

      case 'pie':
        const pieData = types
          .map(type => ({
            name: capitalize(type),
            value: data.reduce((sum: number, item: any) => sum + (item[type] || 0), 0),
            color: checkTranType(type).hex,
            legendFontColor: isDarkColorScheme ? '#fff' : '#333',
            legendFontSize: 12,
          }))
          .filter(item => item.value > 0)

        return (
          <PieChart
            data={pieData}
            width={screenWidth - 60}
            height={200}
            chartConfig={chartConfig}
            accessor="value"
            backgroundColor="transparent"
            paddingLeft="5"
            absolute
          />
        )

      default:
        return (
          <LineChart
            data={chartData}
            width={screenWidth - 40}
            height={380}
            yAxisLabel=""
            chartConfig={chartConfig}
            style={{ marginVertical: 8 }}
            bezier
          />
        )
    }
  }, [chart, data, types, maxKey, isDarkColorScheme])

  return <View style={{ padding: 20 }}>{renderChart()}</View>
}

export default memo(Chart)
