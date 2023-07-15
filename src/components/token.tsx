'use client'
import { Fragment } from 'react'

import { Diamond } from 'lucide-react'

import { useTokenByAddress } from '@/providers/token.provider'
import { shortenAddress } from '@/helpers/utils'

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
