import { useState } from 'react'

import EditRecipient from './row'

import { useRecipients } from '@/providers/merkle.provider'
import { isAddress } from '@/helpers/utils'

const InputRecipient = () => {
  const [address, setAddress] = useState('')
  const [amount, setAmount] = useState('')
  const { recipients, upsertRecipient, removeRecipient } = useRecipients()

  const onAdd = () => {
    if (!isAddress(address) || !amount) return
    upsertRecipient({ address, amount, unlockTime: 0 })
    setAddress('')
    setAmount('')
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      <p>Fill in recipient information</p>

      <div className="gid grid-cols-1 gap-3">
        <EditRecipient
          address={address}
          amount={amount}
          onAddress={setAddress}
          onAmount={setAmount}
          onAdd={onAdd}
        />
        {recipients.map(({ address, amount }, i) => (
          <EditRecipient
            address={address}
            amount={amount}
            key={`${address}-${i}`}
            index={`${i + 1}`}
            onRemove={() => removeRecipient(address)}
          />
        ))}
      </div>
    </div>
  )
}

export default InputRecipient
