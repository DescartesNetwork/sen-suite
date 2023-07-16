'use client'
import { Fragment } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { utils } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import { BN } from 'bn.js'

import { Diamond } from 'lucide-react'

import { useTokenByAddress } from '@/providers/token.provider'
import { shortenAddress, numeric } from '@/helpers/utils'
import { useMyTokenAccountsSelector } from '@/providers/wallet.provider'
import { undecimalize } from '@/helpers/decimals'

export type TokenLogoProps = {
  address: string
  className?: string
}

export function TokenLogo({
  address,
  className = 'w-12 h-12 rounded-full bg-base-300',
}: TokenLogoProps) {
  const { logoURI, name } = useTokenByAddress(address) || {
    logoURI: '',
    name: '',
  }
  return (
    <div className="avatar placeholder">
      <div className={className}>
        {logoURI ? (
          <img src={logoURI} alt={name} />
        ) : (
          <Diamond className="text-base-content" />
        )}
      </div>
    </div>
  )
}

export type TokenNameProps = {
  address: string
}

export function TokenName({ address }: TokenNameProps) {
  const { name } = useTokenByAddress(address) || {
    name: shortenAddress(address, 6),
  }
  return <Fragment>{name}</Fragment>
}

export type TokenSymbolProps = {
  address: string
}

export function TokenSymbol({ address }: TokenSymbolProps) {
  const { symbol } = useTokenByAddress(address) || {
    symbol: address.substring(0, 6),
  }
  return <Fragment>{symbol}</Fragment>
}

export type TokenBalanceProps = {
  address: string
  format?: string
}

export function MyTokenBalance({
  address,
  format = '0,0.[0000]',
}: TokenBalanceProps) {
  const { publicKey } = useWallet()
  const { decimals } = useTokenByAddress(address) || { decimals: 0 }
  const balance = useMyTokenAccountsSelector<string>((tokenAccounts) => {
    if (!publicKey) return '0'
    const tokenAccount = utils.token.associatedAddress({
      mint: new PublicKey(address),
      owner: publicKey,
    })
    const { amount } = tokenAccounts[tokenAccount.toBase58()] || {
      amount: new BN(0),
    }
    return undecimalize(amount, decimals)
  })

  return <Fragment>{numeric(balance).format(format)}</Fragment>
}
