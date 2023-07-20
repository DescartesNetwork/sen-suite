'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

import { ArrowLeft, Settings } from 'lucide-react'
import { TokenLogo, TokenName, TokenSymbol } from '@/components/token'
import Splash from '@/components/splash'

import { isAddress } from '@/helpers/utils'

// { tokenAddress: 'SENBBKVCM7homnf5RX9zqpf1GFe935hnbU4uVzY1Y6M' }

export default function TokenDetails() {
  const searchParams = useSearchParams()
  const tokenAddress = searchParams.get('tokenAddress')
  const { push } = useRouter()

  useEffect(() => {
    if (!isAddress(tokenAddress))
      return push('/token-creation/edit-token/search')
  }, [tokenAddress, push])

  if (!isAddress(tokenAddress)) return <Splash open />
  return (
    <div className="grid grid-cols-12 gap-2">
      <div className="col-span-full flex flex-row gap-2 items-center justify-between">
        <Link
          className="btn btn-circle btn-ghost btn-sm"
          href="/token-creation/edit-token"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
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
