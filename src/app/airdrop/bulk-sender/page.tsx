'use client'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { parse } from 'papaparse'

import { MintLogo, MintSymbol } from '@/components/mint'
import TokenSelection from '@/components/tokenSelection'
import { ChevronDown } from 'lucide-react'
import Dropzone from '@/components/dropzone'

import {
  useBulkSenderData,
  useBulkSenderMint,
} from '@/providers/bulkSender.provider'
import { isAddress } from '@/helpers/utils'
import { usePushMessage } from '@/components/message/store'

export default function BulkSender() {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File>()
  const { mintAddress, setMintAddress } = useBulkSenderMint()
  const { setData } = useBulkSenderData()
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
    <div className="grid grid-cols-12 gap-6">
      <div
        className="rounded-full border-2 px-4 py-2 col-span-12 flex flex-row justify-between items-center cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <div className="card cursor-pointer flex flex-row items-center gap-2">
          <MintLogo
            className="w-8 h-8 rounded-full"
            mintAddress={mintAddress}
          />
          <p className="font-bold">
            <MintSymbol mintAddress={mintAddress} />
          </p>
        </div>
        <ChevronDown />
      </div>
      {/* Modal Token Selection */}
      <TokenSelection
        open={open}
        onCancel={() => setOpen(false)}
        mintAddress={mintAddress}
        onChange={onMintAddress}
      />
      <div className="col-span-12">
        <Dropzone file={file} onChange={setFile} />
      </div>
      <div className="col-span-12">
        <button
          className="btn btn-primary w-full rounded-full"
          onClick={() => push('/airdrop/bulk-sender/summary')}
          disabled={!isAddress(mintAddress)}
        >
          Skip
        </button>
      </div>
    </div>
  )
}
