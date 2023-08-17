import { useState } from 'react'
import MintInput from './mintInput'

export type MintSetup = {
  mintAddress: string
  weight: string
  isLocked: boolean
}

const emptyMint: MintSetup = {
  mintAddress: '',
  weight: '',
  isLocked: false,
}

const SetupToken = () => {
  const [dataSetup] = useState<MintSetup[]>([emptyMint, emptyMint])

  return (
    <div className="grid grid-cols-12 gap-3">
      <p className="col-span-full mb-2">Select tokens & weights</p>
      <div className="col-span-full flex items-center">
        <p className="flex-auto text-sm">Token</p>
        <p className="text-sm">Weight</p>
      </div>
      {dataSetup.map((data, i) => (
        <div className="col-span-full" key={data.mintAddress + i}>
          <MintInput setupData={data} />
        </div>
      ))}
    </div>
  )
}

export default SetupToken
