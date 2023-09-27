import { useEffect, useMemo, useRef } from 'react'
import dayjs from 'dayjs'
import { utilsBN } from '@sen-use/web3'
import * as echarts from 'echarts/core'
import {
  GridComponent,
  TitleComponent,
  LegendComponent,
  TooltipComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { useLaunchpadByAddress } from '@/providers/launchpad.provider'
import {
  useCalcPrice,
  useGetBalanceAtTime,
  useGetLaunchpadWeight,
} from '@/hooks/launchpad.hook'
import { numeric } from '@/helpers/utils'
import { usePrices } from '@/providers/mint.provider'

echarts.use([
  TitleComponent,
  GridComponent,
  LineChart,
  CanvasRenderer,
  LegendComponent,
  TooltipComponent,
])

type LaunchpadLineChartProps = {
  launchpadAddress: string
}
const MILESTONES = 10

const getTimes = (starTime: number, endTime: number) => {
  const result: number[] = []
  const blockTime = (endTime - starTime) / MILESTONES
  for (let i = 0; i <= MILESTONES; i++) {
    if (i === 0) {
      result[i] = starTime
      continue
    }
    const time = result[result.length - 1] + blockTime
    result[i] = time
  }
  return result
}

const buildOptions = (
  defaultValue: number[],
  currentValue: number[],
  durations: number[],
) => {
  const xAxis = durations.map((time) => dayjs(time).format('DD/MM HH:mm'))

  return {
    tooltip: {
      // Means disable default "show/hide rule".
      trigger: 'item',
      formatter: function (params: any) {
        return `<div style="min-width: 150px; font-weight: 400"><span style="display: flex; justify-content: space-between"><span style="font-size: 14px, font-weight: 400">Price:</span> <span style="font-size: 16px; font-weight: 700">$${numeric(
          params.value,
        ).format(
          '0,0.[000]',
        )}</span></span> <span style="display: flex; justify-content: space-between;"><span style="font-size: 14px; font-weight: 400">Date:</span> <span style="font-size: 16px; font-weight: 700">${
          params.name
        }</span></span></div>`
      },
    },
    xAxis: {
      type: 'category',
      data: xAxis,
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        data: defaultValue,
        type: 'line',
        smooth: true,
        lineStyle: {
          normal: {
            width: 2,
            type: 'dashed',
          },
        },
      },
      {
        data: currentValue,
        type: 'line',
        smooth: true,
      },
    ],
  }
}

const LaunchpadLineChart = ({ launchpadAddress }: LaunchpadLineChartProps) => {
  const { stableMint, startTime, endTime, startReserves } =
    useLaunchpadByAddress(launchpadAddress)
  const calcPriceInPool = useCalcPrice()
  const getLaunchpadWeight = useGetLaunchpadWeight()
  const getBalanceAtTime = useGetBalanceAtTime(launchpadAddress)
  const [stablePrice] = usePrices([stableMint.toBase58()]) || [1]
  const chartRef = useRef(null)

  const durations = useMemo(() => {
    const times = getTimes(
      startTime.toNumber() * 1000,
      endTime.toNumber() * 1000,
    )
    return times
  }, [endTime, startTime])

  const defaultValue = useMemo(() => {
    const prices: number[] = []
    for (const time of durations) {
      const weights = getLaunchpadWeight(time, launchpadAddress)
      const price = calcPriceInPool(
        utilsBN.decimalize(weights[0], 9),
        startReserves[0],
        stablePrice,
        startReserves[1],
        utilsBN.decimalize(weights[1], 9),
      )
      prices.push(price)
    }

    return prices
  }, [
    calcPriceInPool,
    durations,
    getLaunchpadWeight,
    launchpadAddress,
    startReserves,
    stablePrice,
  ])

  const currentValue = useMemo(() => {
    const result: number[] = []
    for (const time of durations) {
      const weights = getLaunchpadWeight(time, launchpadAddress)
      const balances = getBalanceAtTime(time)
      const price = calcPriceInPool(
        utilsBN.decimalize(weights[0], 9),
        balances[0],
        stablePrice,
        balances[1],
        utilsBN.decimalize(weights[1], 9),
      )

      result.push(price)
    }
    return result
  }, [
    calcPriceInPool,
    durations,
    getBalanceAtTime,
    getLaunchpadWeight,
    launchpadAddress,
    stablePrice,
  ])

  useEffect(() => {
    const chart = echarts.init(chartRef.current)
    const options = buildOptions(defaultValue, currentValue, durations)
    chart.setOption(options)
    return () => chart.dispose()
  }, [currentValue, defaultValue, durations])

  return <div ref={chartRef} style={{ width: '100%', height: '306px' }} />
}

export default LaunchpadLineChart
