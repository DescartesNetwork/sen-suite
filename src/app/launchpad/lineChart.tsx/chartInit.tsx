'use client'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import moment from 'dayjs'
import * as echarts from 'echarts/core'
import {
  GridComponent,
  TitleComponent,
  LegendComponent,
  TooltipComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { numeric } from '@/helpers/utils'
import { useCalcPrice, useGetLaunchpadWeight } from '@/hooks/launchpad.hook'
import { useMints } from '@/hooks/spl.hook'
import { usePrices } from '@/providers/mint.provider'
import { decimalize } from '@/helpers/decimals'

echarts.use([
  TitleComponent,
  GridComponent,
  LineChart,
  CanvasRenderer,
  LegendComponent,
  TooltipComponent,
])

type LaunchpadLineChartProps = {
  startPrice: string
  endPrice: string
  balanceA: string
  balanceB: string
  baseMint: string
  startTime: number
  endTime: number
  mint: string
}

const getTimes = (starTime: number, endTime: number) => {
  const result: number[] = []
  const blockTime = (endTime - starTime) / 3
  for (let i = 0; i < 4; i++) {
    if (i === 0) {
      result[i] = starTime
      continue
    }
    const time = result[result.length - 1] + blockTime
    result[i] = time
  }
  return result
}

const buildOptions = (defaultValue: number[], durations: number[]) => {
  const xAxis = durations.map((time) => moment(time).format('DD/MM HH:mm'))
  return {
    tooltip: {
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
      },
    ],
  }
}

const LaunchpadChartInit = ({
  startPrice,
  endPrice,
  balanceA,
  balanceB,
  baseMint,
  startTime,
  endTime,
  mint,
}: LaunchpadLineChartProps) => {
  const calcPriceInPool = useCalcPrice()
  const getLaunchpadWeight = useGetLaunchpadWeight()
  const mints = useMints([mint, baseMint])
  const [decimal, stbDecimal] = mints.map((mint) => mint?.decimals || 9)
  const [stablePrice] = usePrices([baseMint]) || [0]
  const chartRef = useRef(null)

  const getWeight = useCallback(
    (priceA: number, balanceA: number, priceB: number, balanceB: number) => {
      const total = priceA * balanceA + priceB * balanceB
      const weightA = (priceA * balanceA) / total
      const weightB = 1 - weightA
      return [
        decimalize(weightA.toString(), 9),
        decimalize(weightB.toString(), 9),
      ]
    },
    [],
  )

  const durations = useMemo(() => {
    const times = getTimes(startTime, endTime)
    return times
  }, [endTime, startTime])

  const defaultValue = useMemo(() => {
    const prices: number[] = []
    const startWeight = getWeight(
      Number(startPrice),
      Number(balanceA),
      stablePrice,
      Number(balanceB),
    )
    const endWeight = getWeight(
      Number(endPrice),
      Number(balanceA),
      stablePrice,
      Number(balanceB),
    )
    for (const time of durations) {
      const weights = getLaunchpadWeight(
        time,
        '',
        startWeight,
        endWeight,
        startTime / 1000,
        endTime / 1000,
      )
      const price = calcPriceInPool(
        decimalize(weights[0].toString(), 9),
        decimalize(balanceA.toString(), decimal),
        stablePrice,
        decimalize(balanceB.toString(), 9),
        decimalize(weights[1].toString(), stbDecimal),
      )
      prices.push(price)
    }

    return prices
  }, [
    balanceA,
    balanceB,
    calcPriceInPool,
    decimal,
    durations,
    endPrice,
    endTime,
    getLaunchpadWeight,
    getWeight,
    stablePrice,
    startPrice,
    startTime,
    stbDecimal,
  ])
  useEffect(() => {
    const chart = echarts.init(chartRef.current)
    const options = buildOptions(defaultValue, durations)
    chart.setOption(options)
    return () => chart.dispose()
  }, [defaultValue, durations])

  return <div ref={chartRef} style={{ width: '100%', height: '306px' }} />
}

export default LaunchpadChartInit
