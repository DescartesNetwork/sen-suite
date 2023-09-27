'use client'
import { useCallback, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

import { MintAmount, MintSymbol } from '@/components/mint'
import { Info } from 'lucide-react'

import {
  useCalculateMetric,
  useFilterCheques,
  useLaunchpadByAddress,
} from '@/providers/launchpad.provider'
import { useClaim } from '@/hooks/launchpad.hook'
import { usePushMessage } from '@/components/message/store'
import { solscan } from '@/helpers/explorers'

const TOOLTIP_CONTENT =
  'The tokens you bought will be locked while the launchpad is active, you can claim your tokens after it ends.'

type YourBoughtProp = {
  launchpadAddress: string
}
export default function YourBought({ launchpadAddress }: YourBoughtProp) {
  const [loading, setLoading] = useState(false)
  const { publicKey } = useWallet()
  const cheques = useFilterCheques(launchpadAddress, publicKey)
  const { endTime, mint } = useLaunchpadByAddress(launchpadAddress)
  const { totalAsk } = useCalculateMetric(cheques)
  const completed = Number(endTime) < Date.now() / 1000
  const pushMessage = usePushMessage()
  const claim = useClaim(launchpadAddress)

  const onClaim = useCallback(async () => {
    try {
      setLoading(true)
      const txId = await claim()
      pushMessage(
        'alert-success',
        'Successfully claim token. Click here to view on explorer.',
        {
          onClick: () => window.open(solscan(txId || ''), '_blank'),
        },
      )
    } catch (er: any) {
      pushMessage('alert-error', er.message)
    } finally {
      setLoading(false)
    }
  }, [claim, pushMessage])

  return (
    <div className="flex items-center justify-between gap-2">
      <p className="text-sm opacity-60 flex gap-2 items-center">
        Your bought
        <div className="tooltip" data-tip={TOOLTIP_CONTENT}>
          <Info size={16} className=" cursor-pointer" />
        </div>
      </p>
      {!completed ? (
        <h5 className="flex items-center gap-2">
          <MintAmount amount={totalAsk} mintAddress={mint.toBase58()} />{' '}
          <MintSymbol mintAddress={mint.toBase58()} />
        </h5>
      ) : (
        <button onClick={onClaim} className="btn btn-primary rounded-full">
          {loading && <span className="loading loading-spinner loading-xs" />}
          Claim <MintAmount
            amount={totalAsk}
            mintAddress={mint.toBase58()}
          />{' '}
          <MintSymbol mintAddress={mint.toBase58()} />
        </button>
      )}
    </div>
  )
}
