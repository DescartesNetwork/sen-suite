import { useAsync } from 'react-use'

import { ArrowUpRightFromCircle } from 'lucide-react'

import { useDistributors } from '@/providers/merkle.provider'
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
    <div className="card flex flex-row py-4 px-6 rounded-xl bg-base-100 items-center">
      <div className="flex-auto flex flex-col gap-2 ">
        <p className="text-sm opacity-60">Total Distribution</p>
        {loading ? (
          <span className="loading loading-bars loading-xs" />
        ) : (
          <h5>{numeric(totalUSD || 0).format('$0,0.[0000]')}</h5>
        )}
      </div>
      <div className="bg-[#f9575e1a] p-3">
        <ArrowUpRightFromCircle className="text-primary" />
      </div>
    </div>
  )
}

export default TotalDistribution
