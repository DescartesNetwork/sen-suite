import { MintAmount } from '@/components/mint'
import { precision } from '@/hooks/farming.hook'
import {
  useDebtByFarmAddress,
  useFarmByAddress,
} from '@/providers/farming.provider'
import BN from 'bn.js'
import { useMemo } from 'react'

type BoostInfoType = {
  farmAddress: string
  nfts: string[]
  amount: number
}

const BoostInfo = ({ farmAddress, amount, nfts }: BoostInfoType) => {
  const { inputMint } = useFarmByAddress(farmAddress)
  const debt = useDebtByFarmAddress(farmAddress)

  const stakedAmount = useMemo(
    () =>
      !debt || (!amount && !nfts.length)
        ? new BN(0)
        : debt.shares.mul(precision).div(debt.leverage),
    [amount, debt, nfts.length],
  )
  return (
    <div className="card p-4 bg-base-300 mb-4 gap-2">
      <div className="flex justify-between items-center">
        <p className="text-sm opacity-60">Staked LP</p>
        <MintAmount amount={stakedAmount} mintAddress={inputMint.toBase58()} />
      </div>
      <div className="flex justify-between items-center">
        <p className="text-sm opacity-60">LP amount</p>
        <p>23</p>
      </div>
      <div className="flex justify-between items-center">
        <p className="text-sm opacity-60">Total boost rate</p>
        <p>23</p>
      </div>
      <div className="flex justify-between items-center">
        <p className="text-sm opacity-60"> Boosted by NFT</p>
        <p>23</p>
      </div>
      <div className="flex justify-between items-center">
        <p className="text-sm opacity-60"> Total</p>
        <p>23</p>
      </div>
      <p className="text-xs opacity-60">
        *Total = Staked LP + LP amount + Boosted LP
      </p>
    </div>
  )
}

export default BoostInfo
