'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Keypair, PublicKey, SYSVAR_RENT_PUBKEY } from '@solana/web3.js'
import { useRouter } from 'next/navigation'
import { useWallet } from '@solana/wallet-adapter-react'

import TokenKeypair from './tokenKeypair'

import { usePushMessage } from '@/components/message/store'
import { useSpl } from '@/hooks/spl.hook'
import { isAddress } from '@/helpers/utils'
import { solscan } from '@/helpers/explorers'
import solConfig from '@/configs/sol.config'

export default function NewToken() {
  const { push } = useRouter()
  const [keypair, setKeypair] = useState<Keypair>(new Keypair())
  const [decimals, setDecimals] = useState(9)
  const { publicKey } = useWallet()
  const [mintAuthority, setMintAuthority] = useState('')
  const [freezeAuthority, setFreezeAuthority] = useState('')
  const [loading, setLoading] = useState(false)
  const pushMessage = usePushMessage()
  const spl = useSpl()

  const ok = useMemo(() => {
    if (!keypair) return false
    if (decimals < 0 || decimals > 18) return false
    if (!isAddress(mintAuthority)) return false
    if (!isAddress(freezeAuthority)) return false
    return true
  }, [keypair, decimals, mintAuthority, freezeAuthority])

  const onCreate = useCallback(async () => {
    try {
      setLoading(true)
      if (!ok) throw new Error('Please double check your inputs.')
      if (!spl.provider.sendAndConfirm)
        throw new Error('Wallet is not connected yet.')
      const txId = await spl.methods
        .initializeMint(
          decimals,
          new PublicKey(mintAuthority),
          new PublicKey(freezeAuthority),
        )
        .accounts({
          mint: keypair.publicKey,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .preInstructions([await spl.account.mint.createInstruction(keypair)])
        .signers([keypair])
        .rpc()
      pushMessage(
        'alert-success',
        'Successfully created a new token. Click here to view on explorer.',
        {
          onClick: () =>
            window.open(solscan(txId, solConfig.network), '_blank'),
        },
      )
      push(
        `/token-creation/edit-token/details?mintAddress=${keypair.publicKey.toBase58()}`,
      )
    } catch (er: any) {
      pushMessage('alert-error', er.message)
    } finally {
      setLoading(false)
    }
  }, [
    ok,
    pushMessage,
    push,
    spl,
    keypair,
    decimals,
    mintAuthority,
    freezeAuthority,
  ])

  useEffect(() => {
    setMintAuthority(publicKey?.toBase58() || '')
    setFreezeAuthority(publicKey?.toBase58() || '')
  }, [publicKey])

  return (
    <div className="grid grid-cols-12 gap-x-2 gap-y-4">
      <div className="col-span-full">
        <TokenKeypair keypair={keypair} onChange={setKeypair} />
      </div>
      <div className="col-span-full flex flex-col gap-2">
        <p className="text-sm font-bold">Token Decimals</p>
        <input
          className="input w-full bg-base-200"
          type="number"
          step={1}
          min={0}
          max={18}
          name="decimals"
          placeholder="Decimals"
          value={decimals}
          onChange={(e) => setDecimals(Number(e.target.value))}
        />
      </div>
      <div className="col-span-full flex flex-col gap-2">
        <p className="text-sm font-bold">Mint Authority</p>
        <input
          className={
            'input w-full bg-base-200' +
            (!isAddress(mintAuthority) ? ' ring-2 ring-primary' : '')
          }
          type="text"
          name="mint-authority"
          placeholder="Mint Authority"
          value={mintAuthority}
          onChange={(e) => setMintAuthority(e.target.value)}
        />
      </div>
      <div className="col-span-full flex flex-col gap-2">
        <p className="text-sm font-bold">Freeze Authority</p>
        <input
          className={
            'input w-full bg-base-200' +
            (!isAddress(freezeAuthority) ? ' ring-2 ring-primary' : '')
          }
          type="text"
          name="freeze-authority"
          placeholder="Freeze Authority"
          value={freezeAuthority}
          onChange={(e) => setFreezeAuthority(e.target.value)}
        />
      </div>
      <div className="col-span-full">
        <button
          className="btn btn-primary w-full"
          onClick={onCreate}
          disabled={loading || !ok}
        >
          {loading && <div className="loading loading-spinner" />}
          Create
        </button>
      </div>
    </div>
  )
}
