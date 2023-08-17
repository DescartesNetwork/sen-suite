import { MintLogo, MintSymbol } from '@/components/mint'
import { MintSetup } from './index'
import { ChevronDown } from 'lucide-react'
import TokenSelection from '@/components/tokenSelection'
import { useState } from 'react'

type MintInputProps = {
  setupData: MintSetup
}

const MintInput = ({ setupData }: MintInputProps) => {
  const [open, setOpen] = useState(false)

  const { mintAddress } = setupData
  return (
    <div className="flex items-center">
      <div
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 border cursor-pointer rounded-3xl py-1 px-2 bg-base-200"
      >
        <MintLogo mintAddress={mintAddress} className="w-8 h-8 rounded-full" />
        <p>{mintAddress ? <MintSymbol mintAddress={mintAddress} /> : 'TOKN'}</p>
        <ChevronDown size={16} />
      </div>
      <TokenSelection
        open={open}
        onCancel={() => setOpen(false)}
        mintAddress={mintAddress}
        onChange={() => {}}
      />
    </div>
  )
}

export default MintInput
