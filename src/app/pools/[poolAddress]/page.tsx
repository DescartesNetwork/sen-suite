'use client'
import { useRouter } from 'next/navigation'
import { useWallet } from '@solana/wallet-adapter-react'

import { MintLogo } from '@/components/mint'
import Withdraw from './withdraw'
import Deposit from './deposit'
import PoolInfo from './poolInfo'
import Heros from './heros'
import Volume24h from './volume24h'
import PoolWeights from './poolWeights'
import PoolManagement from './management'

import { usePoolByAddress } from '@/providers/pools.provider'
import { isAddress } from '@/helpers/utils'

const PoolDetails = ({
  params: { poolAddress },
}: {
  params: { poolAddress: string }
}) => {
  const pool = usePoolByAddress(poolAddress)
  const { publicKey } = useWallet()
  const isOwner = publicKey?.toString() === pool.authority.toBase58()
  const { push } = useRouter()

  if (!isAddress(poolAddress)) return push('/farming')
  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-full">
        <PoolInfo poolAddress={poolAddress} />
      </div>
      <div className="col-span-full flex items-center">
        <div className="flex-auto flex gap-2 items-center">
          <MintLogo
            className="h-10 w-10 rounded-full"
            mintAddress={pool.mintLpt.toBase58()}
          />
          <h5>Balansol LP</h5>
        </div>
        <div className="flex gap-2 items-center">
          <Withdraw poolAddress={poolAddress} />
          <Deposit poolAddress={poolAddress} />
        </div>
      </div>
      <div className="col-span-full">
        <Heros poolAddress={poolAddress} />
      </div>
      <div className="md:col-span-6 col-span-12">
        <Volume24h />
      </div>
      <div className="md:col-span-6 col-span-12">
        <PoolWeights poolAddress={poolAddress} />
      </div>
      {isOwner && publicKey && (
        <div className="md:col-span-6 col-span-12">
          <PoolManagement poolAddress={poolAddress} />
        </div>
      )}
    </div>
  )
}

export default PoolDetails
