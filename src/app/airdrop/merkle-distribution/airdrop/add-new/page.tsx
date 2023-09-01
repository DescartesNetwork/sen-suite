'use client'
import { useMemo, useState } from 'react'

import InputConfigs from './inputConfigs'
import InputRecipient from './inputRecipient'
import CreateMerkle from '@/app/airdrop/merkle-distribution/createMerkle'

import { CreateStep } from '@/app/airdrop/merkle-distribution/constants'

export default function AddNew() {
  const [step, setStep] = useState(CreateStep.InputConfigs)

  const renderPage = useMemo(() => {
    switch (step) {
      case CreateStep.InputConfigs:
        return <InputConfigs setStep={setStep} />
      case CreateStep.InputRecipients:
        return <InputRecipient setStep={setStep} />
      case CreateStep.Confirm:
        return <CreateMerkle setStep={setStep} />
    }
  }, [step])

  return (
    <div className="flex flex-col gap-6 ">
      <h5>Add new Airdrop</h5>
      <div className="card bg-base-100 p-6 ">{renderPage}</div>
    </div>
  )
}
