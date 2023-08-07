'use client'
import { useMemo, useState } from 'react'

import InputMetadata from './inputMetadata'
import InputRecipient from './inputRecipient'
import CreateMerkle from '../../createMerkle'

export enum CreateStep {
  InputMetadata,
  InputRecipients,
  Confirm,
}

const AddNew = () => {
  const [step, setStep] = useState(CreateStep.InputMetadata)

  const renderPage = useMemo(() => {
    switch (step) {
      case CreateStep.InputMetadata:
        return <InputMetadata setStep={setStep} />
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

export default AddNew
