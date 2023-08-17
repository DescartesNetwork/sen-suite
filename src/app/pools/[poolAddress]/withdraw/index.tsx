import { Fragment, useCallback, useMemo, useState } from 'react'
import classNames from 'classnames'
import { BN } from 'bn.js'

import MintInput from './mintInput'
import TokenReceive from './tokenReceive'
import Modal from '@/components/modal'
import { MintSymbol } from '@/components/mint'

import { usePoolByAddress } from '@/providers/pools.provider'
import { useTokenAccountByMintAddress } from '@/providers/tokenAccount.provider'
import { decimalize } from '@/helpers/decimals'
import { LPT_DECIMALS, useWithdraw } from '@/hooks/pool.hook'
import { usePushMessage } from '@/components/message/store'
import { solscan } from '@/helpers/explorers'

const Withdraw = ({ poolAddress }: { poolAddress: string }) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [lpAmount, setLpAmount] = useState('')
  const [mintSelected, setMintSelected] = useState('')

  const pool = usePoolByAddress(poolAddress)
  const mintAddress = pool.mintLpt.toBase58()
  const { amount: mintAmount } = useTokenAccountByMintAddress(mintAddress) || {
    amount: new BN(0),
  }
  const pushMessage = usePushMessage()

  const withdraw = useWithdraw(poolAddress, lpAmount, mintSelected)
  const onWithdraw = useCallback(async () => {
    try {
      setLoading(true)
      const txId = await withdraw()
      pushMessage(
        'alert-success',
        'Successfully airdrop. Click here to view on explorer.',
        {
          onClick: () => window.open(solscan(txId || ''), '_blank'),
        },
      )
      setOpen(false)
    } catch (er: any) {
      pushMessage('alert-error', er.message)
    } finally {
      setLoading(false)
    }
  }, [withdraw, pushMessage])

  const ok = useMemo(() => {
    if (!lpAmount) return false

    const dlpOut = decimalize(lpAmount, LPT_DECIMALS)
    return !mintAmount.isZero() && mintAmount.gte(dlpOut)
  }, [lpAmount, mintAmount])

  return (
    <Fragment>
      <button onClick={() => setOpen(true)} className="btn btn-sm">
        Withdraw
      </button>
      <Modal open={open} onCancel={() => setOpen(false)}>
        <div className="grid grid-cols-12 gap-6">
          <h5 className="col-span-full">Withdraw</h5>
          <div className=" col-span-full flex flex-col gap-2">
            <p className="text-sm opacity-60">You want to receive</p>
            <div className="flex gap-2 items-center">
              <p
                onClick={() => setMintSelected('')}
                className={classNames(
                  'cursor-pointer px-3 py-1 rounded-lg bg-base-200',
                  {
                    '!bg-[#f9575e1a] text-primary': !mintSelected,
                  },
                )}
              >
                All
              </p>
              {pool.mints.map((mint) => (
                <p
                  onClick={() => setMintSelected(mint.toBase58())}
                  key={mint.toBase58()}
                  className={classNames(
                    'cursor-pointer px-3 py-1 rounded-lg bg-base-200',
                    {
                      '!bg-[#f9575e1a] text-primary':
                        mint.toBase58() === mintSelected || !mintSelected,
                    },
                  )}
                >
                  <MintSymbol mintAddress={mint.toBase58()} />
                </p>
              ))}
            </div>
          </div>
          <div className="col-span-full">
            <MintInput
              amountLp={lpAmount}
              onLpChange={setLpAmount}
              poolAddress={poolAddress}
              isSingle={!!mintSelected}
            />
          </div>
          <div className="col-span-full">
            <TokenReceive
              poolAddress={poolAddress}
              mintAddress={mintSelected}
              lptAmount={lpAmount}
            />
          </div>
          <button
            onClick={onWithdraw}
            disabled={!ok}
            className="btn btn-primary col-span-12"
          >
            {loading && <span className="loading loading-spinner loading-xs" />}
            Withdraw
          </button>
        </div>
      </Modal>
    </Fragment>
  )
}

export default Withdraw
