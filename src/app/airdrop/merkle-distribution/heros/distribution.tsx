'use client'
import { useAsync } from 'react-use'

import { ArrowUpRightFromCircle } from 'lucide-react'
import HeroCard from '../heroCard'

import { useDistributors } from '@/providers/airdrop.provider'
import { useWallet } from '@solana/wallet-adapter-react'
import { useMintStore } from '@/providers/mint.provider'
import { undecimalize } from '@/helpers/decimals'
import { getPrice } from '@/helpers/stat'
import { numeric } from '@/helpers/utils'

const TotalDistribution = () => {
  const { publicKey } = useWallet()
  const distributors = useDistributors()
  const metadata = useMintStore(({ metadata }) => metadata)

  const { value: totalUSD, loading } = useAsync(async () => {
    if (!publicKey) return 0
    let usd = 0
    for (const address in distributors) {
      const { authority, total, mint } = distributors[address]
      if (publicKey.equals(authority)) {
        const { decimals } = metadata.find(
          ({ address }) => address === mint.toBase58(),
        ) || { decimals: 0 }
        const numAmount = Number(undecimalize(total, decimals))
        const price = (await getPrice(mint.toBase58())) || 0

        usd += numAmount * price
      }
    }
    return usd
  }, [publicKey, metadata, distributors])

  return (
    <HeroCard
      Icon={ArrowUpRightFromCircle}
      label="Total Distribution"
      loading={loading}
      value={numeric(totalUSD || 0).format('$0,0.[0000]')}
    />
  )
}

export default TotalDistribution
