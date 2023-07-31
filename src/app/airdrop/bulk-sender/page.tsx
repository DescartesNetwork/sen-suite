'use client'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { parse } from 'papaparse'

import { MintLogo, MintSymbol } from '@/components/mint'
import TokenSelection from '@/components/tokenSelection'
import { ChevronDown, Search } from 'lucide-react'
import Dropzone from './dropzone'

import {
  useAirdropData,
  useAirdropMintAddress,
} from '@/providers/airdrop.provider'
import { isAddress } from '@/helpers/utils'
import { usePushMessage } from '@/components/message/store'

export default function BulkSender() {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File>()
  const { mintAddress, setMintAddress } = useAirdropMintAddress()
  const { setData } = useAirdropData()
  const { push } = useRouter()
  const pushMessage = usePushMessage()

  const onMintAddress = useCallback(
    (value: string) => {
      setMintAddress(value)
      setOpen(false)
    },
    [setMintAddress],
  )

  useEffect(() => {
    if (!file) return () => {}
    parse<string[]>(file, {
      complete: ({ data, errors }) => {
        if (errors.length)
          errors.forEach((er) => pushMessage('alert-error', er.message))
        else setData(data)
      },
    })
  }, [file, pushMessage, setData])

  return (
    <div className="grid grid-cols-12 gap-x-2 gap-y-4">
      <div className="col-span-12 flex flex-row gap-2 items-center">
        <div
          className="card bg-base-200 p-2 rounded-full cursor-pointer flex flex-row items-center gap-2"
          onClick={() => setOpen(true)}
        >
          <MintLogo
            className="w-8 h-8 rounded-full"
            mintAddress={mintAddress}
          />
          <p className="font-bold">
            <MintSymbol mintAddress={mintAddress} />
          </p>
          <ChevronDown />
        </div>
        <div className="flex-auto flex flex-row items-center relative">
          <input
            className="input bg-base-200 w-full pr-12 rounded-full"
            type="text"
            placeholder="Token Address"
            value={mintAddress}
            onChange={(e) => onMintAddress(e.target.value)}
          />
          <button
            className="absolute right-2 btn btn-sm btn-circle btn-ghost"
            onClick={() => setOpen(true)}
          >
            <Search />
          </button>
          <TokenSelection
            open={open}
            onCancel={() => setOpen(false)}
            mintAddress={mintAddress}
            onChange={onMintAddress}
          />
        </div>
      </div>
      <div className="col-span-12">
        <Dropzone file={file} onChange={setFile} />
      </div>
      <div className="col-span-12">
        <button
          className="btn btn-primary w-full rounded-full"
          onClick={() => push('/airdrop/bulk-sender/summary')}
          disabled={!isAddress(mintAddress)}
        >
          Next
        </button>
      </div>
    </div>
  )
}
