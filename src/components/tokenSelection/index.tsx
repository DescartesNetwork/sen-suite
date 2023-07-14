'use client'
import { useEffect, useState } from 'react'

import Modal from '@/components/modal'
import Clipboard from '@/components/clipboard'
import { ArrowUpRightSquare, Search } from 'lucide-react'

import { useSearchToken } from '@/providers/token.provider'
import { solscan } from '@/helpers/explorers'

export type TokenSelectionType = {
  open?: boolean
  onCancel?: () => void
}

export default function TokenSelection({ open, onCancel }: TokenSelectionType) {
  const [text, setText] = useState('')
  const [tokens, setTokens] = useState<TokenMetadata[]>([])
  const search = useSearchToken()

  useEffect(() => {
    const data = text.length > 2 ? search(text).map(({ item }) => item) : []
    setTokens(data)
  }, [text, search])

  useEffect(() => {
    if (!open) setText('')
  }, [open])

  return (
    <Modal open={open} onCancel={onCancel}>
      <div className="grid grid-cols-12 gap-2">
        <div className="col-span-12 relative">
          <Search className="pointer-events-none w-4 h-4 absolute top-1/2 transform -translate-y-1/2 left-3" />
          <input
            type="search"
            name="search"
            placeholder="Search"
            className="input input-sm w-full pl-10"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        {tokens.map(({ name, symbol, address, logoURI }) => (
          <div key={address} className="col-span-12">
            <div className="card w-full p-2 rounded-lgsm hover:bg-base-200 cursor-pointer">
              <div className="flex gap-2">
                <div className="avatar">
                  <div className="w-12 h-12 rounded-full">
                    <img src={logoURI} alt={name} />
                  </div>
                </div>
                <div className="flex-auto">
                  <p className="font-semibold">{symbol}</p>
                  <p className="text-sm opacity-80">{name}</p>
                </div>
                <Clipboard content={address} idleText="Copy Token Address" />
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
        ))}
      </div>
    </Modal>
  )
}
