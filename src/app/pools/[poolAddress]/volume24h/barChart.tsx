import { useEffect, useRef } from 'react'
import * as echarts from 'echarts/core'
import { BarChart as BC } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

import { numeric } from '@/helpers/utils'
import { VolumeData } from '@/hooks/pool.hook'
import { useTheme } from '@/providers/ui.provider'

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  BC,
  CanvasRenderer,
  LegendComponent,
])

const buildOptions = (data: VolumeData[]) => ({
  xAxis: {
    type: 'category',
    data: data.map((value) => value.label),
    axisLine: {
      show: false,
    },
    axisTick: {
      show: false,
    },
  },
  yAxis: {
    type: 'value',
    splitLine: {
      show: false,
    },
    axisLabel: {
      formatter: (value: number) => {
        return numeric(value).format('0,0.[00]a')
      },
    },
  },
  tooltip: {
    trigger: 'item',
    borderWidth: '1',
    valueFormatter: (value: any) => '$' + value.toFixed(2),
  },
  series: [
    {
      data: data.map((value) => value.data),
      type: 'bar',
      itemStyle: { color: '#87E0C0' },
    },
  ],
  grid: {
    show: false,
    top: 10,
    left: 40,
    right: 10,
    bottom: 50,
  },
})

const BarChart = ({ data }: { data: VolumeData[] }) => {
  const { theme } = useTheme()
  const chartRef = useRef(null)

  useEffect(() => {
    const chart = echarts.init(chartRef.current)
    const options = buildOptions(data)
    chart.setOption(options)

    return () => chart.dispose()
  }, [data, theme])

  return <div ref={chartRef} style={{ width: '100%', height: '306px' }} />
}

export default BarChart
