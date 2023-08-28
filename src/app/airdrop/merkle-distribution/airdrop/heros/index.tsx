'use client'
import { useAsync } from 'react-use'
import { MerkleDistributor } from '@sentre/utility'

import { MonitorDown, Send, Users } from 'lucide-react'
import HeroCard from '@/app/airdrop/merkle-distribution/heroCard'

import { undecimalize } from '@/helpers/decimals'
import { getPrice } from '@/helpers/stat'
import { numeric } from '@/helpers/utils'
import { useGetMerkleMetadata } from '@/hooks/airdrop.hook'
import { useDistributors, useMyDistributes } from '@/providers/airdrop.provider'
import { useMintStore } from '@/providers/mint.provider'

const Heros = () => {
  return (
    <div className="grid md:grid-cols-3 grid-col-1 gap-6">
      <TotalAirdrop />
      <TotalCampaign />
      <TotalRecipients />
    </div>
  )
}

export default Heros

const TotalCampaign = () => {
  const { airdrops } = useMyDistributes()
  return (
    <HeroCard
      Icon={Send}
      label="Total Campaigns"
      value={airdrops.length.toString()}
    />
  )
}

const TotalAirdrop = () => {
  const { airdrops } = useMyDistributes()
  const distributors = useDistributors()
  const metadata = useMintStore(({ metadata }) => metadata)

  const { value: totalUSD, loading } = useAsync(async () => {
    let usd = 0
    for (const address of airdrops) {
      const { total, mint } = distributors[address]
      const { decimals } = metadata.find(
        ({ address }) => address === mint.toBase58(),
      ) || { decimals: 0 }
      const numAmount = Number(undecimalize(total, decimals))
      const price = (await getPrice(mint.toBase58())) || 0

      usd += numAmount * price
    }
    return usd
  }, [airdrops, distributors])

  return (
    <HeroCard
      Icon={MonitorDown}
      label="Total Airdrop"
      loading={loading}
      value={numeric(totalUSD || 0).format('$0,0.[0000]')}
    />
  )
}

const TotalRecipients = () => {
  const { airdrops } = useMyDistributes()
  const getMetadata = useGetMerkleMetadata()

  const { value: amountRecipient } = useAsync(async () => {
    const mapping: Record<string, string> = {}
    for (const address of airdrops) {
      const metadata = await getMetadata(address)
      const root = MerkleDistributor.fromBuffer(Buffer.from(metadata.data))
      root.receipients.forEach(({ authority }) => {
        mapping[authority.toBase58()] = address
      })
    }
    return Object.keys(mapping).length
  }, [airdrops])

  return (
    <HeroCard
      Icon={Users}
      label="Total Recipients"
      value={(amountRecipient || 0).toString()}
    />
  )
}
