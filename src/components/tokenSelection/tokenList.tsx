'use client'
import { Fragment, useMemo, useState } from 'react'

import LazyLoad from 'react-lazy-load'
import { Dices, History, SearchCheck } from 'lucide-react'
import TokenCard from './tokenCard'

import { useAllTokens, useRandomTokens } from '@/providers/token.provider'
import { useMyTokenAccounts } from '@/providers/wallet.provider'

export type TokenListProps = {
  tokens?: TokenMetadata[]
  mintAddress?: string
  onChange?: (mintAddress: string) => void
}

export default function TokenList({
  tokens,
  mintAddress,
  onChange = () => {},
}: TokenListProps) {
  const [hidden, setHidden] = useState(true)
  const all = useAllTokens()
  const recentTokensAccount = useMyTokenAccounts()
  const randTokens = useRandomTokens()

  const recentTokens = useMemo(() => {
    const mintAddresses = all.map(({ address }) => address)
    const recentAddresses = Object.values(recentTokensAccount)
      .map(({ mint }) => mint.toBase58())
      .sort((a, b) => {
        const x = mintAddresses.includes(a) ? 1 : 0
        const y = mintAddresses.includes(b) ? 1 : 0
        return y - x
      })
    if (!hidden) return recentAddresses
    return recentAddresses.filter((address) => mintAddresses.includes(address))
  }, [all, hidden, recentTokensAccount])

  return (
    <div className="grid grid-cols-12 gap-2 relative max-h-96 overflow-y-auto overflow-x-hidden no-scrollbar">
      {!tokens && (
        <Fragment>
          <div className="sticky top-0 col-span-12 flex gap-2 items-center bg-base-100 z-[1]">
            <History className="w-4 h-4 opacity-60" />
            <h5 className="flex-auto text-sm opacity-60">Recent</h5>
            <div className="form-control">
              <label className="label cursor-pointer gap-2">
                <span className="label-text opacity-60">
                  Hide unknown tokens
                </span>
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={hidden}
                  onChange={(e) => setHidden(e.target.checked)}
                />
              </label>
            </div>
          </div>
          {recentTokens.map((address) => (
            <div key={address} className="col-span-12">
              <LazyLoad height={64}>
                <TokenCard
                  mintAddress={address}
                  onClick={() => onChange(address)}
                  active={address === mintAddress}
                  showBalance
                />
              </LazyLoad>
            </div>
          ))}
        </Fragment>
      )}
      <div className="sticky top-0 col-span-12 bg-base-100 py-2">
        <label className="swap">
          <input type="checkbox" checked={!tokens} readOnly />
          <div className="swap-on flex gap-2 items-center">
            <Dices className="w-4 h-4 opacity-60" />
            <h5 className="flex-auto text-sm opacity-60">Explorer</h5>
          </div>
          <div className="swap-off flex gap-2 items-center">
            <SearchCheck className="w-4 h-4 opacity-60" />
            <h5 className="flex-auto text-sm opacity-60">Search Results</h5>
          </div>
        </label>
      </div>
      {(tokens || randTokens).map(({ address }) => (
        <div key={address} className="col-span-12">
          <LazyLoad height={64}>
            <TokenCard
              mintAddress={address}
              onClick={() => onChange(address)}
              active={address === mintAddress}
            />
          </LazyLoad>
        </div>
      ))}
    </div>
  )
}
