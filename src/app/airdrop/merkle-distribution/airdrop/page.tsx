'use client'
import { useRouter } from 'next/navigation'

import { Plus } from 'lucide-react'

const Airdrop = () => {
  const { push } = useRouter()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex">
        <h4 className="flex-auto">Airdrop</h4>
        <button
          className="btn btn-primary"
          onClick={() => push('/airdrop/merkle-distribution/airdrop/add-new')}
        >
          <Plus className="h-4 w-4" />
          Add New
        </button>
      </div>
    </div>
  )
}

export default Airdrop
