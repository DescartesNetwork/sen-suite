'use client'
import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { TokenLogo, TokenName, TokenSymbol } from '@/components/token'

import { isAddress } from '@/helpers/utils'

export default function EditSpecificToken() {
  const { tokenAddress } = useParams()
  const router = useRouter()

  useEffect(() => {
    if (!isAddress(tokenAddress)) router.push('/token-creation/edit-token')
  }, [tokenAddress, router])

  return (
    <div className="grid grid-cols-12 gap-2">
      <div className="col-span-full">Edit Specific Token</div>
      <div className="col-span-full flex flex-row gap-2 items-center">
        <TokenLogo tokenAddress={tokenAddress} />
        <p className="font-bold">
          <TokenSymbol tokenAddress={tokenAddress} />
        </p>
        <p className="opacity-60">
          <TokenName tokenAddress={tokenAddress} />
        </p>
      </div>
    </div>
  )
}
