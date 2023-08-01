'use client'
import { ChangeEvent, useCallback, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PublicKey } from '@solana/web3.js'
import { useWallet } from '@solana/wallet-adapter-react'

import { MintLogo } from '@/components/mint'
import { ImagePlus, X } from 'lucide-react'

import { isAddress, numeric } from '@/helpers/utils'
import { useMpl, useNfts } from '@/hooks/mpl.hook'
import { useSpl, useMints } from '@/hooks/spl.hook'
import { undecimalize } from '@/helpers/decimals'
import { usePushMessage } from '@/components/message/store'
import { solscan } from '@/helpers/explorers'

export default function TokenDetails() {
  const { push } = useRouter()
  const searchParams = useSearchParams()
  const mintAddress = searchParams.get('mintAddress') || ''
  const [mintSymbol, setMintSymbol] = useState<string>()
  const [mintName, setMintName] = useState<string>()
  const [mintAuthority, setMintAuthority] = useState<string>()
  const [freezeAuthority, setFreezeAuthority] = useState<string>()
  const [logo, setLogo] = useState<File>()
  const ref = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const pushMessage = usePushMessage()
  const { publicKey } = useWallet()
  const spl = useSpl()
  const mpl = useMpl()

  const [nft] = useNfts([mintAddress])
  const [mint] = useMints([mintAddress])

  const onUpdate = useCallback(async () => {
    try {
      setLoading(true)
      if (!publicKey || !mpl) throw new Error('Wallet is not connected.')
      if (!isAddress(mintAddress)) throw new Error('Invalid parameters.')

      const txId = await spl.methods
        .setAuthority(
          { freezeAccount: {} },
          isAddress(freezeAuthority) ? new PublicKey(freezeAuthority) : null,
        )
        .accounts({
          owned: new PublicKey(mintAddress),
          owner: publicKey,
          signer: publicKey,
        })
        .rpc()
      pushMessage(
        'alert-success',
        'Successfully update new data to the token. Click here to view on explorer.',
        {
          onClick: () => window.open(solscan(txId), '_blank'),
        },
      )
    } catch (er: any) {
      pushMessage('alert-error', er.message)
    } finally {
      setLoading(false)
    }
  }, [pushMessage, spl, mpl, publicKey, mintAddress, freezeAuthority])

  const onUpload = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const [logo] = Array.from(e.target.files || [])
    return setLogo(logo)
  }, [])

  const onClearLogo = useCallback(() => {
    if (ref.current?.value) ref.current.value = ''
    return setLogo(undefined)
  }, [ref])

  if (!isAddress(mintAddress)) return push('/token-creation/edit-token/search')
  return (
    <div className="grid grid-cols-12 gap-x-2 gap-y-4">
      <div className="col-span-full flex flex-row justify-center">
        <div className="group relative cursor-pointer">
          <MintLogo
            mintAddress={mintAddress}
            className="w-24 h-24 rounded-full ring ring-secondary ring-offset-base-100 ring-offset-2"
            fallback={logo ? URL.createObjectURL(logo) : ''}
          />
          <button
            className="invisible group-hover:visible btn btn-circle btn-sm btn-neutral absolute -right-1 -top-1"
            onClick={onClearLogo}
            disabled={!logo}
          >
            <X className="w-4 h-4" />
          </button>
          <label className="btn btn-circle btn-sm btn-secondary absolute -right-1 -bottom-1">
            <ImagePlus className="w-4 h-4" />
            <input
              type="file"
              name="token-logo"
              accept="image/*"
              className="invisible absolute"
              onChange={onUpload}
              ref={ref}
            />
          </label>
        </div>
      </div>
      <div className="col-span-full flex flex-col gap-2">
        <span className="flex flex-row items-center gap-2">
          <p className="flex-auto text-sm font-bold">Total Supply</p>
          <p className="text-sm font-bold">Decimals</p>
          <span className="badge badge-neutral font-bold">
            {mint?.decimals}
          </span>
        </span>
        <input
          className="input bg-base-200 w-full"
          type="text"
          name="supply"
          placeholder="Supply"
          value={numeric(
            mint ? undecimalize(mint.supply, mint.decimals) : 0,
          ).format('0,0')}
          readOnly
        />
      </div>
      <div className="col-span-6 flex flex-col gap-2">
        <p className="text-sm font-bold">Token Name</p>
        <input
          className="input bg-base-200 w-full"
          type="text"
          name="token-name"
          placeholder="Token Name"
          defaultValue={nft?.name}
          value={mintName}
          onChange={(e) => setMintName(e.target.value)}
        />
      </div>
      <div className="col-span-6 flex flex-col gap-2">
        <p className="text-sm font-bold">Token Symbol</p>
        <input
          className="input bg-base-200 w-full"
          type="text"
          name="token-symbol"
          placeholder="Token Symbol"
          defaultValue={nft?.symbol}
          value={mintSymbol}
          onChange={(e) => setMintSymbol(e.target.value)}
        />
      </div>
      <div className="col-span-full flex flex-col gap-2">
        <p className="text-sm font-bold">Mint Authority</p>
        <input
          className="input bg-base-200 w-full"
          type="text"
          name="mint-authority"
          placeholder="Mint Authority"
          defaultValue={
            !mint?.mintAuthority
              ? ''
              : (mint?.mintAuthority as PublicKey).toBase58()
          }
          value={mintAuthority}
          onChange={(e) => setMintAuthority(e.target.value)}
        />
      </div>
      <div className="col-span-full flex flex-col gap-2">
        <span>
          <span
            className="tooltip tooltip-warning"
            data-tip="You will no longer be able to activate the Freeze Authority since it is unauthorized (i.e. when the field is empty)."
          >
            <p className="text-sm font-bold cursor-pointer text-error">
              Freeze Authority
            </p>
          </span>
        </span>
        <input
          className="input bg-base-200 w-full"
          type="text"
          name="freeze-authority"
          placeholder={
            !mint?.freezeAuthority ? 'Deactivated' : 'Freeze Authority'
          }
          defaultValue={
            !mint?.freezeAuthority
              ? ''
              : (mint?.freezeAuthority as PublicKey).toBase58()
          }
          value={freezeAuthority}
          onChange={(e) => setFreezeAuthority(e.target.value)}
          disabled={!mint?.freezeAuthority}
        />
      </div>
      <div className="col-span-full">
        <button
          className="btn btn-primary w-full"
          onClick={onUpdate}
          disabled={loading}
        >
          {loading && <span className="loading loading-spinner" />} Update
        </button>
      </div>
    </div>
  )
}
