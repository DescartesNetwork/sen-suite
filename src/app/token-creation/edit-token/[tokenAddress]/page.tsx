'use client'
import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { TokenLogo, TokenName, TokenSymbol } from '@/components/token'

import { isAddress } from '@/helpers/utils'
import { ArrowLeft, Settings } from 'lucide-react'

export default function EditSpecificToken() {
  const { tokenAddress } = useParams()
  const router = useRouter()

  useEffect(() => {
    if (!isAddress(tokenAddress)) router.push('/token-creation/edit-token')
  }, [tokenAddress, router])

  return (
    <div className="grid grid-cols-12 gap-2">
      <div className="col-span-full flex flex-row gap-2 items-center justify-between">
        <button
          className="btn btn-circle btn-ghost btn-sm"
          onClick={() => router.push('/token-creation/edit-token')}
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <p className="font-bold">Token Metadata</p>
        <button className="btn btn-circle btn-ghost btn-sm">
          <Settings className="h-4 w-4" />
        </button>
      </div>
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
