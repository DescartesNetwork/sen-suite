'use client'
import { useAsync } from 'react-use'
import { MerkleDistributor } from '@sentre/utility'

import { MonitorDown, Send, Users } from 'lucide-react'
import HeroCard from '@/app/airdrop/merkle-distribution/heroCard'

import { undecimalize } from '@/helpers/decimals'
import { getPrice } from '@/helpers/stat'
import { numeric } from '@/helpers/utils'
import { useMerkleMetadata } from '@/hooks/airdrop.hook'
import { useDistributors, useMyDistributes } from '@/providers/airdrop.provider'
import { useMintStore } from '@/providers/mint.provider'

const Heros = () => {
  return (
    <div className="grid md:grid-cols-3 grid-col-1 gap-6">
      <TotalVesting />
      <TotalCampaign />
      <TotalRecipients />
    </div>
  )
}

export default Heros

const TotalCampaign = () => {
  const { vesting } = useMyDistributes()
  return (
    <HeroCard
      Icon={Send}
      label="Total Campaigns"
      value={vesting.length.toString()}
    />
  )
}

const TotalVesting = () => {
  const { vesting } = useMyDistributes()
  const distributors = useDistributors()
  const metadata = useMintStore(({ metadata }) => metadata)

  const { value: totalUSD, loading } = useAsync(async () => {
    let usd = 0
    for (const address of vesting) {
      const { total, mint } = distributors[address]
      const { decimals } = metadata.find(
        ({ address }) => address === mint.toBase58(),
      ) || { decimals: 0 }
      const numAmount = Number(undecimalize(total, decimals))
      const price = (await getPrice(mint.toBase58())) || 0

      usd += numAmount * price
    }
    return usd
  }, [vesting, distributors])

  return (
    <HeroCard
      Icon={MonitorDown}
      label="Total Vesting"
      loading={loading}
      value={numeric(totalUSD || 0).format('$0,0.[0000]')}
    />
  )
}

const TotalRecipients = () => {
  const { vesting } = useMyDistributes()
  const getMetadata = useMerkleMetadata()

  const { value: amountRecipient } = useAsync(async () => {
    const mapping: Record<string, string> = {}
    for (const address of vesting) {
      const metadata = await getMetadata(address)
      const root = MerkleDistributor.fromBuffer(Buffer.from(metadata.data))
      root.receipients.forEach(({ authority }) => {
        mapping[authority.toBase58()] = address
      })
    }
    return Object.keys(mapping).length
  }, [vesting])

  return (
    <HeroCard
      Icon={Users}
      label="Total Recipients"
      value={(amountRecipient || 0).toString()}
    />
  )
}
