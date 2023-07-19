'use client'
import { isAddress } from '@/helpers/utils'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function EditToken() {
  const router = useRouter()
  const [tokenAddress, setTokenAddress] = useState('')

  return (
    <div className="grid grid-cols-12 gap-2 justify-center">
      <div className="col-span-full">
        <p className="text-sm font-bold w-full text-center">
          Enter Your Token Address
        </p>
      </div>
      <div className="col-span-full">
        <input
          type="text"
          name="token-address"
          placeholder="Token Address"
          className={
            'input w-full bg-base-200' +
            (!!tokenAddress && !isAddress(tokenAddress)
              ? ' ring-2 ring-error'
              : '')
          }
          value={tokenAddress}
          onChange={(e) => setTokenAddress(e.target.value)}
        />
      </div>
      <div className="col-span-full">
        <button
          className="btn btn-primary w-full"
          onClick={() =>
            router.push(`/token-creation/edit-token/${tokenAddress}`)
          }
          disabled={!isAddress(tokenAddress)}
        >
          Enter
        </button>
      </div>
    </div>
  )
}
