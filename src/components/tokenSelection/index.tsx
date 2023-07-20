'use client'
import { useEffect, useState } from 'react'

import { Search } from 'lucide-react'
import Modal from '@/components/modal'
import Island from '@/components/island'
import TokenList from './tokenList'

import { useSearchToken } from '@/providers/token.provider'

export type TokenSelectionType = {
  open?: boolean
  onCancel?: () => void
  mintAddress?: string
  onChange?: (mintAddress: string) => void
}

export default function TokenSelection({
  open,
  onCancel,
  mintAddress,
  onChange = () => {},
}: TokenSelectionType) {
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
        <div className="col-span-12 relative flex flex-row items-center">
          <Search className="pointer-events-none w-4 h-4 absolute left-3" />
          <input
            type="search"
            name="search"
            placeholder="Search"
            className="input rounded-xl w-full pl-10 bg-base-200"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <div className="col-span-12">
          <Island>
            <TokenList
              tokens={tokens}
              mintAddress={mintAddress}
              onChange={onChange}
            />
          </Island>
        </div>
      </div>
    </Modal>
  )
}
