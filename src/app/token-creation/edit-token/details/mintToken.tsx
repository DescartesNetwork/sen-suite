'use client'
import { Fragment, MouseEvent, useCallback, useMemo, useState } from 'react'
import { utils } from '@coral-xyz/anchor'
import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, Transaction } from '@solana/web3.js'

import Modal from '@/components/modal'

import { usePushMessage } from '@/components/message/store'
import { decimalize } from '@/helpers/decimals'
import { useInitPDAAccount, useMints, useSpl } from '@/hooks/spl.hook'
import { useAnchorProvider } from '@/providers/wallet.provider'
import { useAllTokenAccounts } from '@/providers/tokenAccount.provider'
import { isAddress } from '@/helpers/utils'

type MintTokenProps = {
  mintAddress: string
}

export default function MintToken({ mintAddress }: MintTokenProps) {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('0')
  const { publicKey } = useWallet()
  const spl = useSpl()
  const pushMessage = usePushMessage()
  const [mint] = useMints([mintAddress])
  const initPDAAccount = useInitPDAAccount()
  const provider = useAnchorProvider()
  const accounts = useAllTokenAccounts()

  const associatedAddress = useMemo(() => {
    if (!publicKey) return ''
    const ataAddress = utils.token.associatedAddress({
      mint: new PublicKey(mintAddress),
      owner: publicKey,
    })
    return ataAddress.toBase58()
  }, [mintAddress, publicKey])

  const ok = useMemo(() => {
    if (!associatedAddress || !mint?.mintAuthority || !publicKey) return false
    const mintAuthority = mint?.mintAuthority as PublicKey

    return publicKey.equals(mintAuthority)
  }, [associatedAddress, mint?.mintAuthority, publicKey])

  const onMintTo = useCallback(
    async (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      if (!publicKey || !isAddress(associatedAddress)) return
      try {
        setLoading(true)

        const tx = new Transaction()
        if (!accounts[associatedAddress]) {
          const txInitAccount = await initPDAAccount(
            new PublicKey(mintAddress),
            publicKey,
          )
          tx.add(txInitAccount)
        }

        const { state } = accounts[associatedAddress] || {
          state: { uninitialized: {} },
        }
        if (Object.keys(state)[0] === 'frozen')
          throw new Error('Your account is Frozen.')

        const txMintTo = await spl.methods
          .mintTo(decimalize(amount, mint?.decimals || 0))
          .accounts({
            account: associatedAddress,
            mint: new PublicKey(mintAddress),
            owner: publicKey,
          })
          .transaction()
        tx.add(txMintTo)

        const txId = await provider.sendAndConfirm(tx)
        pushMessage(
          'alert-success',
          'Successfully created a new token. Click here to view on explorer.',
          { onClick: () => window.open(txId, '_blank') },
        )
        setOpen(false)
      } catch (er: any) {
        pushMessage('alert-error', er.message)
      } finally {
        setLoading(false)
      }
    },
    [
      publicKey,
      associatedAddress,
      accounts,
      spl.methods,
      amount,
      mint?.decimals,
      mintAddress,
      provider,
      pushMessage,
      initPDAAccount,
    ],
  )

  return (
    <Fragment>
      <button
        disabled={!ok}
        onClick={() => setOpen(true)}
        className="btn btn-primary btn-block"
      >
        Mint to
      </button>
      <Modal open={open} onCancel={() => setOpen(false)}>
        <div className="grid grid-cols-12 gap-4">
          <h5 className="col-span-full">Mint Token</h5>
          <div className="col-span-full flex flex-col gap-2">
            <p className="text-sm">Amount</p>
            <input
              className="input bg-base-200 w-full"
              type="number"
              placeholder="Input amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="col-span-full grid grid-cols-2 gap-6">
            <button onClick={() => setOpen(false)} className="btn">
              Cancel
            </button>
            <button
              disabled={!Number(amount) || loading}
              onClick={onMintTo}
              className="btn btn-primary"
            >
              {loading && <span className="loading loading-spinner" />} Mint
            </button>
          </div>
        </div>
      </Modal>
    </Fragment>
  )
}
