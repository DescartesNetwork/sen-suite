'use client'
import { useState } from 'react'
import Link from 'next/link'

import { isAddress } from '@/helpers/utils'

export default function SearchToken() {
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
        <Link
          className={
            'btn btn-primary w-full' +
            (isAddress(tokenAddress) ? '' : ' btn-disabled')
          }
          href={
            isAddress(tokenAddress)
              ? `/token-creation/edit-token/details?tokenAddress=${tokenAddress}`
              : '#'
          }
        >
          Enter
        </Link>
      </div>
    </div>
  )
}
