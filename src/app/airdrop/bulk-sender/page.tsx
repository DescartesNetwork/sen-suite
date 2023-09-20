'use client'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { parse } from 'papaparse'

import { ChevronDown } from 'lucide-react'
import { MintLogo, MintSymbol } from '@/components/mint'
import TokenSelection from '@/components/tokenSelection'
import Dropzone from '@/components/dropzone'
import Island from '@/components/island'

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
    <div className="max-w-md pt-20">
      <div className="card bg-base-100 p-6 rounded-3xl shadow-xl grid grid-cols-12 gap-6 ">
        <div className="col-span-12">
          <h5 className="mb-2">Bulk Sender</h5>
        </div>
        <div className="col-span-12">
          <div className="grid grid-cols-12 gap-6">
            <div
              className="rounded-full border-2 px-4 py-2 col-span-12 flex flex-row justify-between items-center cursor-pointer"
              onClick={() => setOpen(true)}
            >
              {mintAddress ? (
                <div className="flex items-center gap-2 flex-auto">
                  <MintLogo
                    mintAddress={mintAddress}
                    className="w-8 h-8 rounded-full"
                  />
                  <Island>
                    <MintSymbol mintAddress={mintAddress} />
                  </Island>
                </div>
              ) : (
                <p className="font-bold flex-auto"> Select a token</p>
              )}
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
              <Dropzone
                file={file}
                onChange={setFile}
                templateFile="/airdrop.csv"
              />
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
        </div>
      </div>
    </div>
  )
}
