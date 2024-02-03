'use client'
import { Fragment } from 'react'

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { MintSymbol } from '@/components/mint'

import chartConfig from '@/configs/chart.config'
import { useNewPoolStore } from '@/providers/newPool.provider'
import { numeric } from '@/helpers/utils'

export default function Overview() {
  const structure = useNewPoolStore(({ structure }) => structure)

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-full flex flex-row justify-center">
        <h5>The Pool Structure</h5>
      </div>
      <div className="col-span-full">
        <ResponsiveContainer className="min-h-[12rem]">
          <PieChart margin={{ top: 20, left: 20, right: 20, bottom: 20 }}>
            <Pie
              data={structure}
              className="cursor-pointer"
              dataKey="weight"
              nameKey="mintAddress"
              label={({ name, x, y, fill, textAnchor }) => (
                <text x={x} y={y} fill={fill} textAnchor={textAnchor}>
                  <MintSymbol mintAddress={name} />
                </text>
              )}
            >
              {structure.map(({ mintAddress }, i) => (
                <Cell key={mintAddress} fill={chartConfig.pie.colors[i]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return <Fragment />
                const [
                  {
                    payload: { mintAddress, weight },
                  },
                ] = payload
                return (
                  <div className="card rounded-box p-4 bg-base-100 border-2 border-base-300 flex flex-row gap-2">
                    <p className="font-bold">
                      {`${numeric(weight).format('0.[00]')}%`}
                    </p>
                    <p className="font-bold">
                      <MintSymbol
                        mintAddress={mintAddress}
                        defaultValue="TOKEN"
                      />
                    </p>
                  </div>
                )
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
