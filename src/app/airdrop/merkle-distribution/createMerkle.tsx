'use client'
import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'

import { MintAmount, MintSymbol } from '@/components/mint'
import CardOverview from './cardOverview'

import { useInitMerkleTree, useTotalDistribute } from '@/hooks/airdrop.hook'
import {
  useDistributeMintAddress,
  useMerkleStore,
} from '@/providers/merkle.provider'
import { CreateStep } from './airdrop/add-new/page'
import { usePushMessage } from '@/components/message/store'
import { solscan } from '@/helpers/explorers'

const CreateMerkle = ({ setStep }: { setStep: (step: CreateStep) => void }) => {
  const [loading, setLoading] = useState(false)
  const { total } = useTotalDistribute()
  const { mintAddress } = useDistributeMintAddress()
  const destroy = useMerkleStore(({ destroy }) => destroy)

  const pushMessage = usePushMessage()
  const { push } = useRouter()

  const initMerkle = useInitMerkleTree()
  const onInitMerkleTree = useCallback(async () => {
    try {
      setLoading(true)
      const txId = await initMerkle()
      pushMessage(
        'alert-success',
        'Successfully airdrop. Click here to view on explorer.',
        {
          onClick: () => window.open(solscan(txId || ''), '_blank'),
        },
      )
      destroy()
      push('/airdrop/merkle-distribution')
    } catch (er: any) {
      pushMessage('alert-error', er.message)
    } finally {
      setLoading(false)
    }
  }, [destroy, initMerkle, push, pushMessage])
  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-2 justify-items-center">
        <p className="text-sm mb-1">Total transfer</p>
        <h4>
          <MintAmount amount={total} mintAddress={mintAddress} />
        </h4>
        <p className="px-3 py-1 rounded-lg bg-[#f9575e1a] text-primary ">
          <MintSymbol mintAddress={mintAddress} />
        </p>
      </div>
      <CardOverview showExpiration />
      <div className="grid grid-cols-2 gap-6">
        <button
          className="btn"
          onClick={() => setStep(CreateStep.InputRecipients)}
        >
          Cancel
        </button>
        <button onClick={onInitMerkleTree} className="btn btn-primary">
          {loading && <span className="loading loading-spinner loading-xs" />}
          Transfer
        </button>
      </div>
    </div>
  )
}

export default CreateMerkle