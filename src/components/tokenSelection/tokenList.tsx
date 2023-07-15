'use client'
import { useMemo, useState } from 'react'

import LazyLoad from 'react-lazy-load'
import Clipboard from '@/components/clipboard'
import { ArrowUpRightSquare, Dices, History } from 'lucide-react'
import { TokenLogo, TokenName, TokenSymbol } from '../token'

import { solscan } from '@/helpers/explorers'
import { useAllTokens, useRandomTokens } from '@/providers/token.provider'
import { useMyTokenAccounts } from '@/providers/wallet.provider'

export type TokenListProps = {
  tokens?: TokenMetadata[]
}

export default function TokenList({ tokens }: TokenListProps) {
  const [hidden, setHidden] = useState(true)
  const all = useAllTokens()
  const recentTokensAccount = useMyTokenAccounts()
  const randTokens = useRandomTokens()

  const recentTokens = useMemo(() => {
    const tokenAddresses = all.map(({ address }) => address)
    const recentAddresses = Object.values(recentTokensAccount)
      .map(({ mint }) => mint.toBase58())
      .sort((a, b) => {
        const x = tokenAddresses.includes(a) ? 1 : 0
        const y = tokenAddresses.includes(b) ? 1 : 0
        return y - x
      })
    if (!hidden) return recentAddresses
    return recentAddresses.filter((address) => tokenAddresses.includes(address))
  }, [all, hidden, recentTokensAccount])

  return (
    <div className="grid grid-cols-12 gap-2 relative max-h-96 overflow-y-auto overflow-x-hidden no-scrollbar">
      <div className="sticky top-0 col-span-12 flex gap-2 items-center bg-base-100 z-10">
        <History className="w-4 h-4 opacity-60" />
        <h5 className="flex-auto text-sm opacity-60">Recent</h5>
        <div className="form-control">
          <label className="label cursor-pointer gap-2">
            <span className="label-text opacity-60">Hide unknown tokens</span>
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
          <div className="group card w-full p-2 hover:bg-base-200 cursor-pointer">
            <div className="flex gap-2">
              <TokenLogo address={address} />
              <div className="flex-auto">
                <p className="font-semibold">
                  <TokenSymbol address={address} />
                </p>
                <p className="text-sm opacity-60">
                  <TokenName address={address} />
                </p>
              </div>
              <div className="invisible group-hover:visible">
                <Clipboard content={address} idleText="Copy Token Address" />
              </div>
              <div className="invisible group-hover:visible">
                <a
                  className="btn btn-sm btn-ghost btn-square"
                  href={solscan(address)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ArrowUpRightSquare className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      ))}
      <div className="sticky top-0 col-span-12 bg-base-100 z-10 py-2 flex gap-2 items-center">
        <Dices className="w-4 h-4 opacity-60" />
        <h5 className="flex-auto text-sm opacity-60">Explorer</h5>
      </div>
      {(tokens || randTokens).map(({ name, symbol, address, logoURI }) => (
        <div key={address} className="col-span-12">
          <LazyLoad height={64}>
            <div className="group card w-full p-2 hover:bg-base-200 cursor-pointer">
              <div className="flex gap-2">
                <div className="avatar">
                  <div className="w-12 h-12 rounded-full">
                    <img src={logoURI} alt={name} />
                  </div>
                </div>
                <div className="flex-auto">
                  <p className="font-semibold">{symbol}</p>
                  <p className="text-sm opacity-60">{name}</p>
                </div>
                <div className="invisible group-hover:visible">
                  <Clipboard content={address} idleText="Copy Token Address" />
                </div>
                <div className="invisible group-hover:visible">
                  <a
                    className="btn btn-sm btn-ghost btn-square"
                    href={solscan(address)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ArrowUpRightSquare className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </LazyLoad>
        </div>
      ))}
    </div>
  )
}
