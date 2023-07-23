'use client'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { ArrowLeft, Search } from 'lucide-react'
import Clipboard from '@/components/clipboard'
import NewWindow from '@/components/newWindow'
import Sort from './sort'

import {
  useNftBoosted,
  useSortedByApr,
  useSortedByLiquidity,
} from '@/providers/farming.provider'
import { shortenAddress } from '@/helpers/utils'
import { solscan } from '@/helpers/explorers'

export default function FarmingSearch() {
  const { back } = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const farmAddress = searchParams.get('farmAddress')
  const { sortedByLiquidity, setSortedByLiquidity } = useSortedByLiquidity()
  const { sortedByApr, setSortedByApr } = useSortedByApr()
  const { nftBoosted, setNftBoosted } = useNftBoosted()

  if (pathname === '/farming/farm-details')
    return (
      <div className="card bg-base-100 rounded-full p-2 flex flex-row items-center gap-2">
        <div className="flex-auto">
          <button className="btn btn-sm rounded-full" onClick={back}>
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        </div>
        <span className="tooltip" data-tip="Farm Address">
          <p className="font-sm font-bold opacity-60 cursor-pointer">
            {shortenAddress(farmAddress || '')}
          </p>
        </span>
        <Clipboard
          content={farmAddress || ''}
          className="btn btn-sm btn-circle"
        />
        <NewWindow
          href={solscan(farmAddress || '')}
          className="btn btn-sm btn-circle"
        />
      </div>
    )
  return (
    <div className="flex flex-row gap-4 items-center flex-wrap">
      <div className="flex-auto relative flex flex-row items-center min-w-[240px]">
        <Search className="pointer-events-none w-4 h-4 absolute left-3" />
        <input
          className="input rounded-xl w-full pl-10 bg-base-200"
          placeholder="Search by name, address"
        />
      </div>
      <div className="flex flex-row gap-2 items-center">
        <Sort
          title="Liquidity"
          value={sortedByLiquidity}
          onChange={setSortedByLiquidity}
        />
        <span className="divider divider-horizontal m-0" />
        <Sort title="APR" value={sortedByApr} onChange={setSortedByApr} />
        <span className="divider divider-horizontal m-0" />
        <label className="cursor-pointer flex flex-row gap-2 items-center">
          <p className="text-sm font-bold select-none">NFT Boosted Only</p>
          <input
            type="radio"
            name="nft-boosted-only"
            className="radio"
            checked={nftBoosted}
            onClick={() => setNftBoosted(!nftBoosted)}
            readOnly
          />
        </label>
      </div>
    </div>
  )
}
