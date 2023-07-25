'use client'
import { Fragment, useMemo } from 'react'
import BN from 'bn.js'

import { Diamond } from 'lucide-react'

import { useMintByAddress, usePrices } from '@/providers/mint.provider'
import { shortenAddress, numeric } from '@/helpers/utils'
import { undecimalize } from '@/helpers/decimals'
import { useTvl } from '@/hooks/tvl.hook'

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

/**
 * Mint Price
 */
export const useMintPrice = (mintAddress: string) => {
  const [price] = usePrices([mintAddress]) || []
  return price
}
export type MintPriceProps = {
  mintAddress: string
  format?: string
}
export function MintPrice({
  mintAddress,
  format = '$0,0.[000000]',
}: MintPriceProps) {
  const price = useMintPrice(mintAddress)
  return <Fragment>{numeric(price || 0).format(format)}</Fragment>
}

/**
 * Mint Amount
 */
export const useMintAmount = (mintAddress: string, amount: BN) => {
  const { decimals } = useMintByAddress(mintAddress) || { decimals: 9 }
  const value = useMemo(
    () => undecimalize(amount, decimals),
    [amount, decimals],
  )
  return value
}
export type MintAmountProps = {
  amount: BN
  mintAddress: string
  format?: string
}
export function MintAmount({
  amount,
  mintAddress,
  format = '0,0.[0000]',
}: MintAmountProps) {
  const value = useMintAmount(mintAddress, amount)
  return <Fragment>{numeric(value).format(format)}</Fragment>
}

/**
 * Mint Value
 */
export const useMintValue = (mintAddress: string, amount: BN) => {
  const value = useTvl([{ mintAddress, amount }])
  return value
}
export type MintValueProps = {
  amount: BN
  mintAddress: string
  format?: string
}
export function MintValue({
  amount,
  mintAddress,
  format = '$0,0.[00]',
}: MintAmountProps) {
  const value = useMintValue(mintAddress, amount)
  return <Fragment>{numeric(value).format(format)}</Fragment>
}
