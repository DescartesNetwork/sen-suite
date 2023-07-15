'use client'

import LazyLoad from 'react-lazy-load'
import Clipboard from '@/components/clipboard'
import { ArrowUpRightSquare } from 'lucide-react'
import { TokenLogo, TokenName, TokenSymbol } from '../token'

import { solscan } from '@/helpers/explorers'
import { useRandomTokens } from '@/providers/token.provider'
import { useMyTokenAccounts } from '@/providers/wallet.provider'

export type TokenListProps = {
  tokens?: TokenMetadata[]
}

export default function TokenList({ tokens }: TokenListProps) {
  const recentTokensAccount = useMyTokenAccounts()
  const randTokens = useRandomTokens()

  return (
    <div className="grid grid-cols-12 gap-2 max-h-96 overflow-y-auto overflow-x-hidden no-scrollbar">
      <div className="col-span-12 sticky">
        <h5 className="text-sm opacity-60">Recent</h5>
      </div>
      {Object.values(recentTokensAccount)
        .map(({ mint }) => mint.toBase58())
        .map((address) => (
          <div key={address} className="col-span-12">
            <div className="group card w-full p-2 rounded-lgsm hover:bg-base-200 cursor-pointer">
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
      <div className="col-span-12 sticky">
        <h5 className="text-sm opacity-60">Explorer</h5>
      </div>
      {(tokens || randTokens).map(({ name, symbol, address, logoURI }) => (
        <div key={address} className="col-span-12">
          <LazyLoad height={64}>
            <div className="group card w-full p-2 rounded-lgsm hover:bg-base-200 cursor-pointer">
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
