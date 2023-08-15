'use client'
import { useEffect, useRef } from 'react'

import * as echarts from 'echarts/core'
import { PieChart } from 'echarts/charts'
import {
  GridComponent,
  TitleComponent,
  LegendComponent,
} from 'echarts/components'

import { CanvasRenderer } from 'echarts/renderers'
import { numeric } from '@/helpers/utils'
import { useTheme } from '@/providers/ui.provider'

echarts.use([
  TitleComponent,
  GridComponent,
  PieChart,
  CanvasRenderer,
  LegendComponent,
])

export type PoolWeightData = {
  symbol: string
  weight: number
  tokenAmount: string
}

const buildOptions = (
  data: PoolWeightData[],
  style: { color: string; backgroundColor: string },
) => {
  return {
    legend: {
      bottom: 0,
      icon: 'circle',
      textStyle: {
        color: style.color,
      },
    },
    tooltip: {
      trigger: 'item',
      borderWidth: '1',
      formatter: function (params: any) {
        return `<div style="min-width: 200px; font-weight: 400"><span style="color: #9CA1AF; font-size: 12px">${params.data.name}</span><br/><span style="display: flex; justify-content: space-between"><span style="font-size: 14px, font-weight: 400">Weight&nbsp;</span> <span style="font-size: 16px; font-weight: 700">${params.data.value}%</span></span> <span style="display: flex; justify-content: space-between;"><span style="font-size: 14px; font-weight: 400">Token amount&nbsp;</span> <span style="font-size: 16px; font-weight: 700">${params.data.tokenAmount}</span></span></div>`
      },
      backgroundColor: style.backgroundColor,
      extraCssText: 'border-radius: 24px',
      textStyle: {
        color: style.color,
      },
    },
    series: [
      {
        type: 'pie',
        radius: '70%',
        avoidLabelOverlap: false,
        top: 0,
        label: {
          show: true,
          position: 'inside',
          formatter: '{c}%',
        },
        labelLine: {
          show: true,
        },
        bottom: 0,
        data: data.map((value) => {
          return {
            name: value.symbol,
            value: numeric(value.weight).format('0,0.[00]'),
            tokenAmount: value.tokenAmount,
          }
        }),
      },
    ],
  }
}

const STYLE = {
  light: {
    color: '#081438',
    backgroundColor: '#F2F4FA',
  },
  dark: {
    color: '#F3F3F5',
    backgroundColor: '#212C4C',
  },
}

const DoughnutChart = ({ data }: { data: PoolWeightData[] }) => {
  const { theme } = useTheme()
  const chartRef = useRef(null)

  useEffect(() => {
    const chart = echarts.init(chartRef.current)
    const options = buildOptions(data, STYLE[theme])
    chart.setOption(options)

    return () => chart.dispose()
  }, [data, theme])

  return (
    <div
      ref={chartRef}
      className="flex justify-center"
      style={{ width: '100%', height: '306px' }}
    />
  )
}

export default DoughnutChart
