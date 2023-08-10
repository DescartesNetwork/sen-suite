import { useAsync } from 'react-use'

import { ArrowDownLeftFromCircle } from 'lucide-react'
import HeroCard from '../heroCard'

import { undecimalize } from '@/helpers/decimals'
import { getPrice } from '@/helpers/stat'
import { numeric } from '@/helpers/utils'
import { useDistributors, useMyReceipts } from '@/providers/merkle.provider'
import { useMintStore } from '@/providers/mint.provider'

const TotalReceived = () => {
  const myReceipts = useMyReceipts()
  const metadata = useMintStore(({ metadata }) => metadata)
  const distributors = useDistributors()

  const { value: totalUSD, loading } = useAsync(async () => {
    let total = 0
    for (const address in myReceipts) {
      const { amount, distributor } = myReceipts[address]
      const { mint } = distributors[distributor.toBase58()]
      const price = (await getPrice(mint.toBase58())) || 0
      const { decimals } = metadata.find(
        ({ address }) => address === mint.toBase58(),
      ) || { decimals: 0 }
      const numAmount = Number(undecimalize(amount, decimals))
      total += numAmount * price
    }
    return total
  }, [myReceipts, distributors])

  return (
    <HeroCard
      Icon={ArrowDownLeftFromCircle}
      label="Total Received"
      loading={loading}
      value={numeric(totalUSD || 0).format('$0,0.[0000]')}
    />
  )
}

export default TotalReceived
