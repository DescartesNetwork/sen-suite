'use client'
import { ChangeEvent, Fragment, useCallback, useMemo, useState } from 'react'
import parse from 'parse-duration'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'

import { ChevronDown } from 'lucide-react'
import { MintLogo, MintSymbol } from '@/components/mint'
import DatePicker from 'react-datepicker'
import TokenSelection from '@/components/tokenSelection'
import Dropzone from '@/app/airdrop/bulk-sender/dropzone'

import {
  useDistributeConfigs,
  useDistributeMintAddress,
} from '@/providers/merkle.provider'
import { CreateStep } from './page'

dayjs.extend(duration)
dayjs.extend(relativeTime)

const TEGTime = () => {
  const { configs, upsertConfigs } = useDistributeConfigs()
  const { tgePercent, tgeTime } = configs

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (Number(val) > 100 || Number(val) < 0) return
    upsertConfigs({ tgePercent: Number(val) })
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="flex flex-col gap-3">
        <p className="text-xs opacity-60">TGE Percentage (Optional)</p>
        <input
          type="number"
          className="bg-base-200 p-3 rounded-lg"
          placeholder="Input %"
          value={tgePercent ? tgePercent : undefined}
          onChange={onChange}
        />
      </div>
      <div className="flex flex-col gap-3">
        <p className="flex-auto text-xs opacity-60">TGE Time</p>
        <DatePicker
          showIcon
          selected={tgeTime ? new Date(tgeTime) : null}
          onChange={(date) => upsertConfigs({ tgeTime: date?.getTime() })}
          className="bg-base-200 !p-3 rounded-lg w-full"
          placeholderText="Select time"
          dateFormat={'dd/MM/yyyy, HH:mm'}
          showTimeInput
          showTimeSelect
        />
      </div>
    </div>
  )
}

const cliffItems = [
  parse('1month')!,
  parse('3months')!,
  parse('6months')!,
  parse('12months')!,
]
const CliffTime = () => {
  const { configs, upsertConfigs } = useDistributeConfigs()

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs opacity-60">Cliff</p>
      <div className="dropdown ">
        <label
          tabIndex={0}
          className="flex items-center bg-base-200 p-3 rounded-lg"
        >
          <p className="flex-auto">
            {dayjs.duration(configs.cliff, 'milliseconds').humanize()}
          </p>
          <ChevronDown className="w-3 h-3" />
        </label>
        <ul
          tabIndex={0}
          className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-full"
        >
          {cliffItems.map((cliff) => (
            <li key={cliff} onClick={() => upsertConfigs({ cliff })}>
              <p>{dayjs.duration(cliff, 'milliseconds').humanize()}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

const distributesIn = [
  parse('6months')!,
  parse('1y')!,
  parse('2y')!,
  parse('4y')!,
]
const DistributeIn = () => {
  const { configs, upsertConfigs } = useDistributeConfigs()
  const { distributeIn } = configs
  return (
    <div className="flex flex-col gap-3">
      <p className="flex-auto text-xs opacity-60">Distribute in</p>
      <div className="dropdown ">
        <label
          tabIndex={0}
          className="flex items-center bg-base-200 p-3 rounded-lg"
        >
          <p className="flex-auto">
            {dayjs.duration(distributeIn, 'milliseconds').humanize()}
          </p>
          <ChevronDown className="w-3 h-3" />
        </label>
        <ul
          tabIndex={0}
          className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-full"
        >
          {distributesIn.map((time) => (
            <li
              key={time}
              onClick={() => upsertConfigs({ distributeIn: time })}
            >
              <p>{dayjs.duration(time, 'milliseconds').humanize()}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

const frequencies = [
  parse('1month')!,
  parse('3months')!,
  parse('6months')!,
  parse('12months')!,
]
const DistributeFrequency = () => {
  const { configs, upsertConfigs } = useDistributeConfigs()
  const { frequency } = configs

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs opacity-60">Distribution frequency</p>
      <div className="dropdown ">
        <label
          tabIndex={0}
          className="flex items-center bg-base-200 p-3 rounded-lg"
        >
          <p className="flex-auto">
            {dayjs.duration(frequency, 'milliseconds').humanize()}
          </p>
          <ChevronDown className="w-3 h-3" />
        </label>
        <ul
          tabIndex={0}
          className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-full"
        >
          {frequencies.map((frequency) => (
            <li key={frequency} onClick={() => upsertConfigs({ frequency })}>
              <p>{dayjs.duration(frequency, 'milliseconds').humanize()}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

const Expiration = () => {
  const [unlimited, setUnlimited] = useState(true)
  const { configs, upsertConfigs } = useDistributeConfigs()
  const expiration = configs.expiration

  const onTimeChange = (name: keyof typeof configs, value: Date | null) => {
    if (!value) return
    upsertConfigs({ [name]: new Date(value).getTime() })
  }

  return (
    <div className="flex flex-col gap-3 ">
      <div className="flex items-center">
        <p className="flex-auto text-xs opacity-60">Expiration time</p>
        <p className="mr-2 text-xs opacity-60">Unlimited</p>
        <input
          onChange={(e) => {
            setUnlimited(e.target.checked)
            upsertConfigs({ expiration: 0 })
          }}
          className="toggle toggle-xs"
          type="checkbox"
          checked={unlimited}
        />
      </div>
      <DatePicker
        showIcon
        selected={expiration ? new Date(expiration) : null}
        onChange={(date) => onTimeChange('expiration', date)}
        className="bg-base-200 !p-3 rounded-lg w-full"
        placeholderText="Select time"
        dateFormat={'dd/MM/yyyy, HH:mm'}
        showTimeInput
        showTimeSelect
        disabled={unlimited}
      />
    </div>
  )
}

const MintSelection = () => {
  const [open, setOpen] = useState(false)
  const { mintAddress, setMintAddress } = useDistributeMintAddress()

  const onMintAddress = useCallback(
    (value: string) => {
      setMintAddress(value)
      setOpen(false)
    },
    [setMintAddress],
  )

  return (
    <div className="col-span-12 flex flex-col gap-3">
      <p>Select a token and template</p>
      <div
        className="flex items-center border cursor-pointer rounded-lg p-2"
        onClick={() => setOpen(true)}
      >
        {mintAddress ? (
          <div className="flex items-center gap-2 flex-auto">
            <MintLogo
              mintAddress={mintAddress}
              className="w-8 h-8 rounded-full"
            />
            <MintSymbol mintAddress={mintAddress} />
          </div>
        ) : (
          <p className="font-bold flex-auto"> Select a token</p>
        )}
        <ChevronDown className="h-4 w-4" />
      </div>
      <TokenSelection
        open={open}
        onCancel={() => setOpen(false)}
        mintAddress={mintAddress}
        onChange={onMintAddress}
      />
    </div>
  )
}

const InputConfigs = ({ setStep }: { setStep: (step: CreateStep) => void }) => {
  const [file, setFile] = useState<File>()
  const { mintAddress } = useDistributeMintAddress()
  const { configs } = useDistributeConfigs()

  const ok = useMemo(
    () => !!mintAddress && !!configs.tgeTime,
    [mintAddress, configs],
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="grid  md:grid-cols-2 grid-cols-1 gap-6">
        <div className="grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12">
            <MintSelection />
          </div>
          {!file && (
            <Fragment>
              <div className="col-span-12">
                <TEGTime />
              </div>
              <div className="col-span-6">
                <CliffTime />
              </div>
              <div className="col-span-6">
                <DistributeFrequency />
              </div>
              <div className="col-span-6">
                <DistributeIn />
              </div>
            </Fragment>
          )}
          <div className="col-span-6">
            <Expiration />
          </div>
        </div>
        <Dropzone file={file} onChange={setFile} />
      </div>
      <div className="grid grid-cols-2 gap-6">
        <button className="btn">Cancel</button>
        <button
          onClick={() => setStep(CreateStep.InputRecipients)}
          disabled={!ok}
          className="btn btn-primary"
        >
          Continue
        </button>
      </div>
    </div>
  )
}

export default InputConfigs
