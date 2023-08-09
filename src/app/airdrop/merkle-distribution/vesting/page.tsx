'use client'
import { useRouter } from 'next/navigation'

import { Plus } from 'lucide-react'
import History from '../history'

import { Distribute } from '@/hooks/airdrop.hook'

const Vesting = () => {
  const { push } = useRouter()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex">
        <h4 className="flex-auto">Vesting</h4>
        <button
          className="btn btn-primary"
          onClick={() => push('/airdrop/merkle-distribution/vesting/add-new')}
        >
          <Plus className="h-4 w-4" />
          Add New
        </button>
      </div>
      <History type={Distribute.Vesting} />
    </div>
  )
}

export default Vesting
