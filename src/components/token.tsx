'use client'
import { Fragment } from 'react'

import { Diamond } from 'lucide-react'

import { useTokenByAddress } from '@/providers/token.provider'
import { shortenAddress, numeric } from '@/helpers/utils'
import { useMyReadableBalanceByTokenAddress } from '@/providers/wallet.provider'

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
  const balance = useMyReadableBalanceByTokenAddress(tokenAddress)

  return <Fragment>{numeric(balance).format(format)}</Fragment>
}
