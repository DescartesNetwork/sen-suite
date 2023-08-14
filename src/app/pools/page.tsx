'use client'
import { useMemo, useState } from 'react'
import classNames from 'classnames'

import PoolCard from './poolCard'
import LazyLoad from 'react-lazy-load'
import Empty from '@/components/empty'
import { Search, X } from 'lucide-react'

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

const Pools = () => {
  const [text, setText] = useState('')
  const [filterKey, setFilterKey] = useState(FilterPools.AllPools)
  const poolsFilter = useFilterPools(filterKey)
  const pools = useSearchPool(poolsFilter, text)

  const sortedPool = useMemo(() => {
    const filtered = new Set(PRIORITIZE_POOLS.filter((addr) => pools[addr]))
    for (const elm of Object.keys(pools)) filtered.add(elm)
    return Array.from(filtered)
  }, [pools])

  const IconSearch = text.length ? X : Search

  return (
    <div className="grid grid-cols-12 gap-4 @container">
      <div className="col-span-12 grid grid-cols-12 gap-2">
        <div className="col-span-3">
          <select
            value={filterKey}
            onChange={(e) => setFilterKey(e.target.value as FilterPools)}
            className="select select-sm w-full max-w-xs bg-base-200 rounded-full"
          >
            <option value={FilterPools.AllPools}>All pools</option>
            <option value={FilterPools.DepositedPools}>Deposited pools</option>
            <option value={FilterPools.YourPools}>Your pools</option>
          </select>
        </div>
        <div className="col-span-6 relative">
          <input
            type="text"
            className="w-full input-sm input bg-base-200 rounded-full"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Search"
          />
          <IconSearch
            size={16}
            className={classNames('absolute right-3 top-1/2 -translate-y-1/2', {
              'cursor-pointer': !!text,
            })}
            onClick={() => {
              if (text) setText('')
            }}
          />
        </div>
      </div>
      {sortedPool.map((poolAddress) => (
        <LazyLoad key={poolAddress} className="col-span-full">
          <PoolCard poolAddress={poolAddress} />
        </LazyLoad>
      ))}
      {!sortedPool.length && (
        <div className="col-span-full justify-center p-4">
          <Empty />
        </div>
      )}
    </div>
  )
}

export default Pools
