import { useTokenByAddress } from '@/providers/token.provider'
import { Fragment } from 'react'

export type TokenLogoProps = {
  address: string
  className?: string
}

export function TokenLogo({
  address,
  className = 'w-12 h-12 rounded-full',
}: TokenLogoProps) {
  const { logoURI, name } = useTokenByAddress(address)
  return (
    <div className="avatar">
      <div className={className}>
        <img src={logoURI} alt={name} />
      </div>
    </div>
  )
}

export type TokenNameProps = {
  address: string
}

export function TokenName({ address }: TokenNameProps) {
  const { name } = useTokenByAddress(address)
  return <Fragment>{name}</Fragment>
}

export type TokenSymbolProps = {
  address: string
}

export function TokenSymbol({ address }: TokenSymbolProps) {
  const { symbol } = useTokenByAddress(address)
  return <Fragment>{symbol}</Fragment>
}
