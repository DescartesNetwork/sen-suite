'use client'
import { Fragment } from 'react'

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { MintSymbol } from '@/components/mint'

import chartConfig from '@/configs/chart.config'
import { useNewPoolStore } from '@/providers/newPool.provider'
import { numeric } from '@/helpers/utils'
import { ArrowUpRightSquare, Info } from 'lucide-react'

export default function Overview() {
  const structure = useNewPoolStore(({ structure }) => structure)

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-full flex flex-row gap-1 justify-center items-center">
        <h5>The Pool Structure</h5>
        <div className="dropdown dropdown-end">
          <div
            role="button"
            tabIndex={0}
            className="btn btn-circle btn-xs btn-ghost"
          >
            <Info className="h-4 w-4" />
          </div>
          <div
            tabIndex={0}
            className="dropdown-content z-[1] card rounded-box bg-base-100 p-4 border-2 border-base-300 shadow-xl w-[256px] grid grid-cols-12 gap-2"
          >
            <p className="col-span-full text-xs">
              Senswap allows you to create a pool with multiple tokens.
              Furthermore, you can adjust the weighted pool.
            </p>
            <p className="col-span-full text-xs">
              For example, if you would like to run your tokens with a limit
              budget of USDC, you can create a pool of 90% YOUR-TOKEN and 10% of
              USDC.
            </p>
            <a
              className="col-span-full btn btn-primary btn-sm"
              href="https://docs.senswap.sentre.io/"
              target="_blank"
              rel="noreferrer"
            >
              Read More
              <ArrowUpRightSquare className="w-4 h-4" />
            </a>
          </div>
        </div>
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
