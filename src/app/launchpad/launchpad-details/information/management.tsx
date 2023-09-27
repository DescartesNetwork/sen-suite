'use client'
import { useCallback, useMemo, useState } from 'react'
import BN from 'bn.js'

import { Info } from 'lucide-react'
import { MintAmount, MintLogo, MintSymbol } from '@/components/mint'

import { useLaunchpadByAddress } from '@/providers/launchpad.provider'
import { usePoolByAddress } from '@/providers/pools.provider'
import { useMints } from '@/hooks/spl.hook'
import { useWithdraw } from '@/hooks/launchpad.hook'
import { usePushMessage } from '@/components/message/store'
import { solscan } from '@/helpers/explorers'

type ManagementProps = {
  launchpadAddress: string
}
export default function Management({ launchpadAddress }: ManagementProps) {
  const [loading, setLoading] = useState(false)
  const [withdrawn, setWithdrawn] = useState(false)

  const { mint, stableMint, startReserves, pool, endTime } =
    useLaunchpadByAddress(launchpadAddress)
  const { reserves, mintLpt } = usePoolByAddress(pool.toBase58())
  const completed = Date.now() / 1000 >= endTime.toNumber()
  const [mintLptInfo] = useMints([mintLpt.toBase58()])
  const supply = mintLptInfo?.supply || new BN(0)
  const pushMessage = usePushMessage()

  const withdraw = useWithdraw(launchpadAddress, supply)
  const onWithdraw = useCallback(async () => {
    try {
      setLoading(true)
      const txId = await withdraw()
      pushMessage(
        'alert-success',
        'Successfully claim token. Click here to view on explorer.',
        {
          onClick: () => window.open(solscan(txId || ''), '_blank'),
        },
      )
      setWithdrawn(true)
    } catch (er: any) {
      pushMessage('alert-error', er.message)
    } finally {
      setLoading(false)
    }
  }, [pushMessage, withdraw])

  const assets = useMemo(() => {
    const stableAmount = reserves[1].gt(startReserves[1])
      ? reserves[1].sub(startReserves[1])
      : new BN(0)

    return [
      { mint, amount: reserves[0] },
      {
        mint: stableMint,
        amount: stableAmount,
      },
    ]
  }, [mint, reserves, stableMint, startReserves])

  return (
    <div className="grid grid-cols-12 gap-6">
      <p className="text-sm flex items-center gap-2 col-span-full">
        <Info size={16} />
        The launchpad had completed, you can withdraw your tokens.
      </p>
      <div className="col-span-full flex flex-col gap-2">
        <p className="opacity-60 text-sm">Your Assets</p>
        <div className="grid grid-cols-12 gap-2">
          {assets.map(({ amount, mint }) => (
            <div
              key={mint.toBase58()}
              className="col-span-6 flex gap-2 items-center"
            >
              <MintLogo className="h-5 w-5" mintAddress={mint.toBase58()} />{' '}
              <MintAmount amount={amount} mintAddress={mint.toBase58()} />{' '}
              <MintSymbol mintAddress={mint.toBase58()} />
            </div>
          ))}
        </div>
      </div>

      <button
        disabled={!completed || assets[0].amount.isZero() || withdrawn}
        className="btn col-span-full btn-primary mt-2"
        onClick={onWithdraw}
      >
        {loading && <span className="loading loading-spinner loading-xs" />}
        Withdraw
      </button>
    </div>
  )
}
