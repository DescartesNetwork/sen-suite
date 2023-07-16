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
  tokenAddress: string
  className?: string
}

export function TokenLogo({
  tokenAddress,
  className = 'w-12 h-12 rounded-full bg-base-300',
}: TokenLogoProps) {
  const { logoURI, name } = useTokenByAddress(tokenAddress) || {
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
  tokenAddress: string
}

export function TokenName({ tokenAddress }: TokenNameProps) {
  const { name } = useTokenByAddress(tokenAddress) || {
    name: shortenAddress(tokenAddress, 6),
  }
  return <Fragment>{name}</Fragment>
}

export type TokenSymbolProps = {
  tokenAddress: string
}

export function TokenSymbol({ tokenAddress }: TokenSymbolProps) {
  const { symbol } = useTokenByAddress(tokenAddress) || {
    symbol: tokenAddress.substring(0, 6),
  }
  return <Fragment>{symbol}</Fragment>
}

export type TokenBalanceProps = {
  tokenAddress: string
  format?: string
}

export function MyTokenBalance({
  tokenAddress,
  format = '0,0.[0000]',
}: TokenBalanceProps) {
  const { publicKey } = useWallet()
  const { decimals } = useTokenByAddress(tokenAddress) || { decimals: 0 }
  const balance = useMyTokenAccountsSelector<string>((tokenAccounts) => {
    if (!publicKey || !tokenAddress) return '0'
    const tokenAccount = utils.token.associatedAddress({
      mint: new PublicKey(tokenAddress),
      owner: publicKey,
    })
    const { amount } = tokenAccounts[tokenAccount.toBase58()] || {
      amount: new BN(0),
    }
    return undecimalize(amount, decimals)
  })

  return <Fragment>{numeric(balance).format(format)}</Fragment>
}
