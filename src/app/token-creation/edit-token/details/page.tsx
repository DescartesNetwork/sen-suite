'use client'
import { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PublicKey } from '@solana/web3.js'

import { TokenLogo } from '@/components/token'
import Splash from '@/components/splash'

import { isAddress, numeric } from '@/helpers/utils'
import { useMpl, useNft } from '@/hooks/mpl.hook'
import { useMint, useSpl } from '@/hooks/spl.hook'
import { undecimalize } from '@/helpers/decimals'
import { usePushMessage } from '@/components/message/store'
import { solscan } from '@/helpers/explorers'
import { useWallet } from '@solana/wallet-adapter-react'
import solConfig from '@/configs/sol.config'

export default function TokenDetails() {
  const searchParams = useSearchParams()
  const mintAddress = searchParams.get('mintAddress')
  const { push } = useRouter()
  const [mintSymbol, setMintSymbol] = useState<string>()
  const [mintName, setMintName] = useState<string>()
  const [mintAuthority, setMintAuthority] = useState<string>()
  const [freezeAuthority, setFreezeAuthority] = useState<string>()
  const [loading, setLoading] = useState(false)
  const pushMessage = usePushMessage()
  const { publicKey } = useWallet()
  const spl = useSpl()
  const mpl = useMpl()

  const nft = useNft(mintAddress || '')
  const mint = useMint(mintAddress || '')

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
          onClick: () =>
            window.open(solscan(txId, solConfig.network), '_blank'),
        },
      )
    } catch (er: any) {
      pushMessage('alert-error', er.message)
    } finally {
      setLoading(false)
    }
  }, [pushMessage, spl, mpl, publicKey, mintAddress, freezeAuthority])

  useEffect(() => {
    if (!isAddress(mintAddress))
      return push('/token-creation/edit-token/search')
  }, [mintAddress, push])

  if (!isAddress(mintAddress)) return <Splash open />
  return (
    <div className="grid grid-cols-12 gap-x-2 gap-y-4">
      <div className="col-span-full flex flex-row justify-center">
        <TokenLogo
          mintAddress={mintAddress}
          className="w-24 h-24 mask mask-squircle"
        />
      </div>
      <div className="col-span-full flex flex-col gap-2">
        <span className="flex flex-row items-center gap-2">
          <p className="flex-auto text-sm font-bold">Total Supply</p>
          <p className="text-sm font-bold">Decimals</p>
          <span className="badge badge-neutral">{mint?.decimals}</span>
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