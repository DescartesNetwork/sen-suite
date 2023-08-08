import { useCallback, useMemo, useState } from 'react'
import { BN } from 'bn.js'
import dayjs from 'dayjs'

import EditRecipient from '../../airdrop/add-new/row'
import CardOverview from '../../cardOverview'
import { Trash } from 'lucide-react'

import {
  RecipientData,
  useDistributeConfigs,
  useDistributeMintAddress,
  useRecipients,
} from '@/providers/merkle.provider'
import { decimalize, undecimalize } from '@/helpers/decimals'
import { useMintByAddress } from '@/providers/mint.provider'
import { shortenAddress } from '@/helpers/utils'
import { useTotalDistribute } from '@/hooks/airdrop.hook'
import { useTokenAccountByMintAddress } from '@/providers/tokenAccount.provider'
import { CreateStep } from './page'

const RecipientsList = () => {
  const { recipients, setRecipients } = useRecipients()

  const formatRecipient = useMemo(() => {
    const result: Record<string, Array<Omit<RecipientData, 'address'>>> = {}
    recipients.forEach(({ address, amount, unlockTime }) => {
      if (!result[address]) return (result[address] = [{ amount, unlockTime }])
      return result[address].push({ amount, unlockTime })
    })
    return result
  }, [recipients])

  const onRemove = (address: string) => {
    const nextRecipients = [...recipients].filter(
      (recipient) => recipient.address !== address,
    )
    setRecipients(nextRecipients)
  }

  return (
    <div className="grid grid-cols-12 bg-base-200 rounded-lg">
      {/* Header */}
      <div className="col-span-12 grid grid-cols-12 gap-3 p-4 ">
        <div className="col-span-1">
          <p className="text-xs opacity-60">No.</p>
        </div>
        <div className="col-span-2">
          <p className="text-xs opacity-60">Wallet address</p>
        </div>
        <div className="col-span-7">
          <p className="text-xs opacity-60">Amount & Unlock time</p>
        </div>
      </div>
      {/* list recipients body */}
      {Object.keys(formatRecipient).map((address, index) => (
        <div
          key={address}
          className="col-span-12 grid grid-cols-12 gap-3 px-4 py-2 items-center"
        >
          <div className="col-span-1">
            <p className="text-sm">#{index + 1}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm">{shortenAddress(address)}</p>
          </div>
          <div className="col-span-8 flex gap-2 flex-wrap">
            {formatRecipient[address].map(({ amount, unlockTime }) => (
              <p key={unlockTime} className="border px-2 py-1 text-sm">
                {amount} / {dayjs(unlockTime).format('MMM DD, YYYY HH:mm')}
              </p>
            ))}
          </div>
          <div className="col-span-1">
            <button
              className="btn btn-ghost btn-sm btn-square"
              onClick={() => onRemove(address)}
            >
              <Trash className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
type InputRecipientProps = {
  setStep: (step: CreateStep) => void
}
export default function InputRecipients({ setStep }: InputRecipientProps) {
  const [address, setAddress] = useState('')
  const [amount, setAmount] = useState('')

  const { configs } = useDistributeConfigs()
  const { mintAddress } = useDistributeMintAddress()
  const { decimals } = useMintByAddress(mintAddress)
  const { upsertRecipient, setRecipients, recipients } = useRecipients()
  const { total, quantity } = useTotalDistribute()
  const { amount: myAmount } = useTokenAccountByMintAddress(mintAddress) || {
    amount: new BN(0),
  }

  const onRemoveOld = useCallback(
    (address: string) => {
      const nextRecipients = [...recipients].filter(
        (recipient) => recipient.address !== address,
      )
      setRecipients(nextRecipients)
    },
    [recipients, setRecipients],
  )

  const onAdd = useCallback(() => {
    if (decimals === undefined) return
    const existed = recipients.find(
      (recipient) => recipient.address === address,
    )
    if (existed) onRemoveOld(address)
    const { distributeIn, frequency, tgePercent, tgeTime, cliff } = configs
    const rewardAmount = Math.floor(distributeIn / frequency)
    let unlockTime = tgeTime

    // Fist time (TGE)
    const dAmount = decimalize(amount, decimals)
    const firstReward = tgePercent
      ? dAmount.mul(new BN(tgePercent)).div(new BN(100))
      : new BN(0)
    const restAmount = dAmount.sub(firstReward)
    upsertRecipient({
      address,
      amount: undecimalize(firstReward, decimals),
      unlockTime,
    })
    // Rest rewards
    const singleReward = restAmount.div(new BN(rewardAmount))
    let sum = new BN(0)
    for (let i = 0; i < rewardAmount; i++) {
      if (!i) unlockTime = tgeTime + cliff
      if (i) unlockTime = unlockTime + frequency

      let reward = singleReward
      if (i === rewardAmount - 1) reward = restAmount.sub(sum)
      sum = sum.add(reward)
      upsertRecipient({
        address,
        amount: undecimalize(reward, decimals),
        unlockTime,
      })
    }
    setAddress('')
    setAmount('')
  }, [
    address,
    amount,
    configs,
    decimals,
    onRemoveOld,
    recipients,
    upsertRecipient,
  ])

  const ok = useMemo(
    () => !!quantity && myAmount.gte(total),
    [myAmount, quantity, total],
  )

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12">
        <EditRecipient
          amount={amount}
          onAmount={setAmount}
          address={address}
          onAddress={setAddress}
          onAdd={onAdd}
        />
      </div>
      <div className="col-span-12">
        <RecipientsList />
      </div>
      <div className="col-span-12">
        <CardOverview showTotal />
      </div>
      <div className="col-span-6">
        <button
          onClick={() => {
            setStep(CreateStep.InputConfigs)
            setRecipients([])
          }}
          className="btn w-full"
        >
          Cancel
        </button>
      </div>
      <div className="col-span-6">
        <button
          disabled={!ok}
          className="btn btn-primary w-full"
          onClick={() => setStep(CreateStep.Confirm)}
        >
          {myAmount.lte(total) ? 'Insufficient balance' : 'Continue'}
        </button>
      </div>
    </div>
  )
}
