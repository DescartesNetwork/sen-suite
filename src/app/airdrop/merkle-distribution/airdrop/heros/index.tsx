import { useAsync } from 'react-use'
import { MerkleDistributor } from '@sentre/utility'

import { MonitorDown, Send, Users } from 'lucide-react'

import { undecimalize } from '@/helpers/decimals'
import { getPrice } from '@/helpers/stat'
import { numeric } from '@/helpers/utils'
import { useMerkleMetadata } from '@/hooks/airdrop.hook'
import { useDistributors, useMyDistributes } from '@/providers/merkle.provider'
import { useMintStore } from '@/providers/mint.provider'

const Heros = () => {
  return (
    <div className="grid md:grid-cols-3 grid-col-1 gap-6">
      <TotalAirdrops />
      <TotalCampaign />
      <TotalRecipients />
    </div>
  )
}

export default Heros

const TotalCampaign = () => {
  const { airdrops } = useMyDistributes()
  return (
    <div className="card flex flex-row py-4 px-6 rounded-xl bg-base-100 items-center">
      <div className="flex-auto flex flex-col gap-2 ">
        <p className="text-sm opacity-60">Total Campaigns</p>

        <h5>{airdrops.length}</h5>
      </div>
      <div className="bg-[#f9575e1a] p-3">
        <Send className="text-primary" />
      </div>
    </div>
  )
}

const TotalAirdrops = () => {
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
    <div className="card flex flex-row py-4 px-6 rounded-xl bg-base-100 items-center">
      <div className="flex-auto flex flex-col gap-2 ">
        <p className="text-sm opacity-60">Total Airdrop</p>

        {loading ? (
          <span className="loading loading-bars loading-xs" />
        ) : (
          <h5>{numeric(totalUSD || 0).format('$0,0.[0000]')}</h5>
        )}
      </div>
      <div className="bg-[#f9575e1a] p-3">
        <MonitorDown className="text-primary" />
      </div>
    </div>
  )
}

const TotalRecipients = () => {
  const { airdrops } = useMyDistributes()
  const getMetadata = useMerkleMetadata()

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
    <div className="card flex flex-row py-4 px-6 rounded-xl bg-base-100 items-center">
      <div className="flex-auto flex flex-col gap-2 ">
        <p className="text-sm opacity-60">Total Recipients</p>

        <h5>{amountRecipient || 0}</h5>
      </div>
      <div className="bg-[#f9575e1a] p-3">
        <Users className="text-primary" />
      </div>
    </div>
  )
}
