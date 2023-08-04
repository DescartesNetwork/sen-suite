'use client'
import { ChangeEvent, useCallback, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import { ChevronDown } from 'lucide-react'
import Dropzone from '@/app/airdrop/bulk-sender/dropzone'
import TokenSelection from '@/components/tokenSelection'
import { MintLogo, MintSymbol } from '@/components/mint'

import { CreateStep } from './page'
import {
  useDistributeConfigs,
  useDistributeMintAddress,
} from '@/providers/merkle.provider'
import { isAddress } from '@/helpers/utils'

const InputMetadata = ({ setStep }: { setStep: (val: CreateStep) => void }) => {
  const [open, setOpen] = useState(false)
  const { push } = useRouter()
  const { mintAddress, setMintAddress } = useDistributeMintAddress()
  const { configs, upsertConfigs } = useDistributeConfigs()

  const onMintAddress = useCallback(
    (value: string) => {
      setMintAddress(value)
      setOpen(false)
    },
    [setMintAddress],
  )
  const onTimeChange = (e: ChangeEvent<HTMLInputElement>) =>
    upsertConfigs({ [e.target.name]: e.target.value })

  const ok = useMemo(
    () => configs.unlockTime && isAddress(mintAddress),
    [configs.unlockTime, mintAddress],
  )
  return (
    <div className="flex flex-col gap-6">
      <div className="grid md:grid-cols-2 grid-cols-1 gap-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <p>Select a token and template</p>
            <div
              className="flex items-center border cursor-pointer rounded-lg p-2"
              onClick={() => setOpen(true)}
            >
              {mintAddress ? (
                <div className="flex items-center gap-2 flex-auto">
                  <MintLogo
                    mintAddress={mintAddress}
                    className="w-8 h-8 rounded-full"
                  />
                  <MintSymbol mintAddress={mintAddress} />
                </div>
              ) : (
                <p className="font-bold flex-auto"> Select a token</p>
              )}
              <ChevronDown className="h-4 w-4" />
            </div>
            <TokenSelection
              open={open}
              onCancel={() => setOpen(false)}
              mintAddress={mintAddress}
              onChange={onMintAddress}
            />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-3">
              <p>Unlock time</p>
              <input
                type="datetime-local"
                placeholder="Select time"
                className="border p-1 rounded-md"
                name="unlockTime"
                value={configs.unlockTime}
                onChange={onTimeChange}
              />
            </div>

            <div className="flex flex-col gap-3">
              <p>Expiration time</p>
              <input
                type="datetime-local"
                placeholder="Select time"
                className="border p-1 rounded-md"
                name="expirationTime"
                onChange={onTimeChange}
              />
            </div>
          </div>
        </div>
        <Dropzone />
      </div>
      <div className="grid grid-cols-2 gap-6">
        <button
          className="btn"
          onClick={() => push('airdrop/merkle-distribution/airdrop')}
        >
          Cancel
        </button>
        <button
          onClick={() => setStep(CreateStep.InputRecipients)}
          className="btn btn-primary"
          disabled={!ok}
        >
          Continue
        </button>
      </div>
    </div>
  )
}

export default InputMetadata
