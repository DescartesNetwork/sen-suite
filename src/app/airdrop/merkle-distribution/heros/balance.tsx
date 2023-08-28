'use client'
import { useAsync } from 'react-use'
import BN from 'bn.js'

import { Wallet2 } from 'lucide-react'
import HeroCard from '../heroCard'

import { useAllTokenAccounts } from '@/providers/tokenAccount.provider'
import { useMintStore } from '@/providers/mint.provider'
import { undecimalize } from '@/helpers/decimals'
import { numeric } from '@/helpers/utils'
import { useLamports } from '@/providers/wallet.provider'
import { useMintPrice } from '@/components/mint'
import { getPrice } from '@/helpers/stat'

export const WSOL_ADDRESS = 'So11111111111111111111111111111111111111112'

const TotalBalance = () => {
  const myAccounts = useAllTokenAccounts()
  const solPrice = useMintPrice(WSOL_ADDRESS)
  const metadata = useMintStore(({ metadata }) => metadata)
  const lamports = useLamports()

  const { value: totalUSD, loading } = useAsync(async () => {
    let total = Number(undecimalize(new BN(lamports), 9)) * solPrice
    for (const address in myAccounts) {
      const { amount, mint } = myAccounts[address]
      const price = (await getPrice(mint.toBase58())) || 0
      const { decimals } = metadata.find(
        ({ address }) => address === mint.toBase58(),
      ) || { decimals: 0 }
      const numAmount = Number(undecimalize(amount, decimals))
      total += numAmount * price
    }
    return total
  }, [lamports, metadata, myAccounts, solPrice])

  return (
    <HeroCard
      Icon={Wallet2}
      label="Total balance"
      loading={loading}
      value={numeric(totalUSD || 0).format('$0,0.[0000]')}
    />
  )
}

export default TotalBalance
