'use client'
import { useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { MintLogo, MintSymbol } from '@/components/mint'
import FarmTimeline from '../farmCard/farmTimeline'
import {
  FarmInfoApr,
  FarmInfoMyPosition,
  FarmInfoMyStake,
  FarmInfoTvl,
} from '../farmCard/farmInfo'
import FarmReward from './farmReward'
import MyReward from './myReward'

import { isAddress } from '@/helpers/utils'
import { useFarmByAddress } from '@/providers/farming.provider'

export default function FarmDetails() {
  const { push } = useRouter()
  const searchParams = useSearchParams()
  const farmAddress = searchParams.get('farmAddress') || ''
  const { inputMint } = useFarmByAddress(farmAddress)
  const inputMintAddress = useMemo(
    () => inputMint?.toBase58() || '',
    [inputMint],
  )

  if (!isAddress(farmAddress)) return push('/farming')
  return (
    <div className="grid grid-cols-12 gap-2 @container">
      <div className="col-span-12 @2xl:col-span-8 grid grid-cols-12 gap-4">
        <div className="col-span-full flex flex-row items-center gap-2">
          <MintLogo mintAddress={inputMintAddress} />
          <h4>
            <MintSymbol mintAddress={inputMintAddress} />
          </h4>
        </div>
        <div className="col-span-full -mt-2 mb-2">
          <FarmTimeline farmAddress={farmAddress} />
        </div>
        <div className="col-span-3">
          <FarmInfoApr farmAddress={farmAddress} />
        </div>
        <div className="col-span-3">
          <FarmInfoTvl farmAddress={farmAddress} />
        </div>
        <div className="col-span-3">
          <FarmInfoMyStake farmAddress={farmAddress} />
        </div>
        <div className="col-span-3">
          <FarmInfoMyPosition farmAddress={farmAddress} />
        </div>
        <div className="col-span-6 card bg-base-200 p-4">
          <FarmReward farmAddress={farmAddress} />
        </div>
        <div className="col-span-6 card bg-base-200 p-4 ring-2 ring-primary">
          <MyReward farmAddress={farmAddress} />
        </div>
      </div>
      <div className="divider divider-horizontal m-0" />
      <div className="col-span-12 @2xl:col-span-4 grid grid-cols-12 gap-2"></div>
    </div>
  )
}
