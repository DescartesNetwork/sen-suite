'use client'
import { Fragment } from 'react'

import { Diamond } from 'lucide-react'

import { useMintByAddress } from '@/providers/mint.provider'
import { shortenAddress, numeric } from '@/helpers/utils'
import { useMyReadableBalanceByMintAddress } from '@/providers/wallet.provider'

export type MintLogoProps = {
  mintAddress: string
  className?: string
  iconClassName?: string
  fallback?: string
}

export function MintLogo({
  mintAddress,
  className = 'w-12 h-12 rounded-full bg-base-300',
  iconClassName = 'text-base-content',
  fallback = '',
}: MintLogoProps) {
  const { logoURI, name } = useMintByAddress(mintAddress) || {
    logoURI: fallback,
    name: '',
  }
  return (
    <div className="avatar placeholder">
      <div className={className}>
        {logoURI ? (
          <img src={logoURI} alt={name} />
        ) : (
          <Diamond className={iconClassName} />
        )}
      </div>
    </div>
  )
}

export type MintNameProps = {
  mintAddress: string
}

export function MintName({ mintAddress }: MintNameProps) {
  const { name } = useMintByAddress(mintAddress) || {
    name: shortenAddress(mintAddress, 6),
  }
  return <Fragment>{name}</Fragment>
}

export type MintSymbolProps = {
  mintAddress: string
}

export function MintSymbol({ mintAddress }: MintSymbolProps) {
  const { symbol } = useMintByAddress(mintAddress) || {
    symbol: mintAddress.substring(0, 6),
  }
  return <Fragment>{symbol}</Fragment>
}

export type MintBalanceProps = {
  mintAddress: string
  format?: string
}

export function MyBalance({
  mintAddress,
  format = '0,0.[0000]',
}: MintBalanceProps) {
  const balance = useMyReadableBalanceByMintAddress(mintAddress)

  return <Fragment>{numeric(balance).format(format)}</Fragment>
}
