'use client'
import { useEffect, useState } from 'react'

import Modal from '@/components/modal'
import { Search } from 'lucide-react'
import Island from '../island'
import TokenList from './tokenList'

import { useSearchToken } from '@/providers/token.provider'

export type TokenSelectionType = {
  open?: boolean
  onCancel?: () => void
}

export default function TokenSelection({ open, onCancel }: TokenSelectionType) {
  const [text, setText] = useState('')
  const [tokens, setTokens] = useState<TokenMetadata[] | undefined>()
  const search = useSearchToken()

  useEffect(() => {
    const data = !text.length
      ? undefined
      : text.length <= 2
      ? []
      : search(text).map(({ item }) => item)
    setTokens(data)
  }, [text, search])

  useEffect(() => {
    if (!open) setText('')
  }, [open])

  return (
    <Modal open={open} onCancel={onCancel}>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12">
          <h5>Search your token</h5>
        </div>
        <div className="col-span-12 relative">
          <Search className="pointer-events-none w-4 h-4 absolute top-1/2 transform -translate-y-1/2 left-3" />
          <input
            type="search"
            name="search"
            placeholder="Search"
            className="input input-sm w-full pl-10 bg-base-200"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <div className="col-span-12">
          <Island>
            <TokenList tokens={tokens} />
          </Island>
        </div>
      </div>
    </Modal>
  )
}
