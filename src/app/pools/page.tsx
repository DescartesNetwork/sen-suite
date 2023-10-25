'use client'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import classNames from 'classnames'

import { Plus, Search, X } from 'lucide-react'
import PoolCard from './poolCard'
import LiquidityPoolPanel from './panel'
import LazyLoad from 'react-lazy-load'
import Empty from '@/components/empty'

import { FilterPools, useFilterPools, useSearchPool } from '@/hooks/pool.hook'

const PRIORITIZE_POOLS = [
  'CT2QmamF6kBBDVbkg8WkvF5gnq6q8mDranPi21tdGeeL',
  '4JFd9kHUC4FoKaTL38YMGoXP68MNBT9sC1FZCmfMn1FC',
  'AzPdQteHNWLvgRtFQX2N9K2U14M7rwub4VjEeKhaSbuh',
  '2gtDG2iYam6z4eCjx9yfBD7ayRXQGTDymjqQLiHqr7Z6',
  'FhownP7d2EP7PCeoXVFk11WennsSaCoj4sZaQCEpvC89',
  '13Jn5xugRGjVorHWakzjvdZBMFwPLQniKHRoE6j4BMCC',
  'kPbhNnVmuhqWApxhr156XQV8hhKsysrvwVFmDhCWFY5',
]

export default function Pools() {
  const [text, setText] = useState('')
  const [filterKey, setFilterKey] = useState(FilterPools.AllPools)
  const poolsFilter = useFilterPools(filterKey)
  const pools = useSearchPool(poolsFilter, text)
  const { push } = useRouter()

  const sortedPool = useMemo(() => {
    const filtered = new Set(PRIORITIZE_POOLS.filter((addr) => pools[addr]))
    for (const elm of Object.keys(pools)) filtered.add(elm)
    return Array.from(filtered)
  }, [pools])

  const IconSearch = text.length ? X : Search

  return (
    <div className="flex flex-row max-w-[768px] justify-center">
      <div className="w-full grid grid-cols-12 gap-6">
        <div className="col-span-full">
          <LiquidityPoolPanel />
        </div>
        <div className="col-span-full grid grid-cols-12 gap-2">
          <select
            value={filterKey}
            onChange={(e) => setFilterKey(e.target.value as FilterPools)}
            className="col-span-3 select w-full bg-base-200 rounded-full"
          >
            <option value={FilterPools.AllPools}>All pools</option>
            <option value={FilterPools.DepositedPools}>Deposited pools</option>
            <option value={FilterPools.YourPools}>Your pools</option>
          </select>
          <div className="col-span-6 flex flex-row relative items-center">
            <input
              type="text"
              className="w-full input bg-base-200 rounded-full"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Search"
            />
            <IconSearch
              className={classNames('absolute h-4 w-4 right-4', {
                'cursor-pointer': !!text,
              })}
              onClick={() => {
                if (text) setText('')
              }}
            />
          </div>
          <button
            onClick={() => push('/pools/new-pool')}
            className="col-span-3 btn w-full rounded-full"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden md:block"> Add New</span>
          </button>
        </div>
        <div className="col-span-full grid grid-cols-12 gap-4">
          {sortedPool.map((poolAddress) => (
            <LazyLoad key={poolAddress} className="col-span-full">
              <PoolCard poolAddress={poolAddress} />
            </LazyLoad>
          ))}
        </div>
        {!sortedPool.length && (
          <div className="col-span-full justify-center p-4">
            <Empty />
          </div>
        )}
      </div>
    </div>
  )
}
