'use client'
import { useCallback, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import BN from 'bn.js'

import { MintLogo, MintSymbol, useMintAmount } from '@/components/mint'
import { ChevronDown } from 'lucide-react'
import DatePicker from 'react-datepicker'
import SelectMulti from './selectMulti'
import LaunchpadChartInit from '../../lineChart.tsx/chartInit'
import TokenSelection from '@/components/tokenSelection'

import { useGlobalLaunchpad } from '../page'
import {
  LaunchpadInfo,
  ProjectInfo,
  useInitLaunchpad,
} from '@/hooks/launchpad.hook'
import { useTokenAccountByMintAddress } from '@/providers/tokenAccount.provider'
import { acceptable_categories } from '../../launchpadCard/categoryTag'
import { usePushMessage } from '@/components/message/store'
import { solscan } from '@/helpers/explorers'
import { isAddress, numeric } from '@/helpers/utils'

type LaunchpadConfigProps = {
  onBack: () => void
}

export default function LaunchpadConfig({ onBack }: LaunchpadConfigProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [openStableMint, setOpenStableMint] = useState(false)
  const [launchpadData, setLaunchpadData] = useGlobalLaunchpad()
  const { mint, amount, stableMint, projectInfo } = launchpadData
  const { startPrice, endPrice, startTime, endTime } = launchpadData
  const { category } = projectInfo
  const { amount: mintAmount } = useTokenAccountByMintAddress(mint) || {
    amount: new BN(0),
  }
  const balance = useMintAmount(mint, mintAmount)
  const initLaunchpad = useInitLaunchpad(launchpadData)
  const pushMessage = usePushMessage()
  const { push } = useRouter()

  const onChange = (name: keyof LaunchpadInfo, value: string | number) =>
    setLaunchpadData({ ...launchpadData, [name]: value })

  const onChangeProjectInfo = (
    name: keyof ProjectInfo,
    value: string | number | string[],
  ) => {
    const nextProjectInfo = { ...launchpadData.projectInfo, [name]: value }
    return setLaunchpadData({ ...launchpadData, projectInfo: nextProjectInfo })
  }

  const categories = useMemo(
    () =>
      Object.keys(acceptable_categories).map((category) => ({
        key: category,
        value: category,
      })),
    [],
  )

  const disabled =
    !isAddress(mint) ||
    !amount ||
    !isAddress(stableMint) ||
    !projectInfo.baseAmount ||
    !projectInfo.category.length ||
    !startTime ||
    !endTime ||
    !startPrice ||
    !endPrice

  const onInitLaunchpad = useCallback(async () => {
    try {
      setLoading(true)
      const txId = await initLaunchpad()
      pushMessage(
        'alert-success',
        'Successfully create launchpad. Click here to view on explorer.',
        {
          onClick: () => window.open(solscan(txId || ''), '_blank'),
        },
      )
      push('/launchpad')
    } catch (er: any) {
      console.log(er)
      pushMessage('alert-error', er.message)
    } finally {
      setLoading(false)
    }
  }, [initLaunchpad, push, pushMessage])

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Token launch */}
      <div className="col-span-full flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <p className="text-sm">Your token</p>
          <p
            className="text-xs opacity-60 cursor-pointer"
            onClick={() => onChange('amount', balance)}
          >
            Available: {numeric(balance).format('0,0.[0000]')}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div
            className="flex items-center  cursor-pointer rounded-xl bg-base-200 p-2"
            onClick={() => setOpen(true)}
          >
            {mint ? (
              <div className="flex items-center gap-2 flex-auto">
                <MintLogo mintAddress={mint} className="w-8 h-8 rounded-full" />
                <MintSymbol mintAddress={mint} />
              </div>
            ) : (
              <p className="font-bold flex-auto"> Select a token</p>
            )}
            <ChevronDown className="h-4 w-4" />
          </div>
          <TokenSelection
            open={open}
            onCancel={() => setOpen(false)}
            mintAddress={mint}
            onChange={(mintAddress) => {
              onChange('mint', mintAddress)
              setOpen(false)
            }}
          />
          <input
            type="number"
            className="input bg-base-200"
            placeholder="Input total raise"
            value={amount ? amount : undefined}
            onChange={(e) => onChange('amount', e.target.value)}
          />
        </div>
      </div>
      {/* Purchase token */}
      <div className="col-span-full flex flex-col gap-2">
        <p className="text-sm">Purchase token</p>
        <p className="text-xs opacity-60 ">Should be a stablecoin</p>
        <div className="grid grid-cols-2 gap-3">
          <div
            className="flex items-center  cursor-pointer rounded-xl bg-base-200 p-2"
            onClick={() => setOpenStableMint(true)}
          >
            {stableMint ? (
              <div className="flex items-center gap-2 flex-auto">
                <MintLogo
                  mintAddress={stableMint}
                  className="w-8 h-8 rounded-full"
                />
                <MintSymbol mintAddress={stableMint} />
              </div>
            ) : (
              <p className="font-bold flex-auto"> Select a token</p>
            )}
            <ChevronDown className="h-4 w-4" />
          </div>
          <TokenSelection
            open={openStableMint}
            onCancel={() => setOpenStableMint(false)}
            mintAddress={stableMint}
            onChange={(mintAddress) => {
              onChange('stableMint', mintAddress)
              setOpenStableMint(false)
            }}
          />
          <input
            type="number"
            className="input bg-base-200"
            value={projectInfo.baseAmount ? projectInfo.baseAmount : undefined}
            placeholder="Input fundraising goal"
            onChange={(e) => onChangeProjectInfo('baseAmount', e.target.value)}
          />
        </div>
      </div>
      {/* Category */}
      <div className="col-span-full flex flex-col gap-2">
        <p className="text-sm">Type of project</p>
        <p className="text-xs opacity-60">
          E.g. defi, gamei, lending, DAO... (maximum 4 tags)
        </p>

        <SelectMulti
          placeholder="Select type"
          items={categories}
          selectedValues={category}
          onSelect={(val) => onChangeProjectInfo('category', val)}
          max={4}
        />
      </div>
      {/* Price */}
      <div className="col-span-full grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <p className="text-sm">Start price</p>
          <input
            type="number"
            className="input bg-base-200"
            placeholder="Input price"
            onChange={(e) => onChange('startPrice', e.target.value)}
            value={startPrice ? startPrice : undefined}
          />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-sm">End price</p>
          <input
            type="number"
            className="input bg-base-200"
            placeholder="Input price"
            onChange={(e) => onChange('endPrice', e.target.value)}
            value={endPrice ? endPrice : undefined}
          />
        </div>
      </div>
      {/* Time */}
      <div className="col-span-full grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <p className="text-sm">Start time</p>
          <DatePicker
            showIcon
            selected={new Date(startTime)}
            onChange={(date) =>
              onChange('startTime', new Date(date || 0).getTime())
            }
            className="bg-base-200 !p-3 rounded-lg w-full"
            dateFormat={'dd/MM/yyyy, HH:mm'}
            showTimeInput
            showTimeSelect
            placeholderText="Select time"
          />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-sm">End time</p>
          <DatePicker
            showIcon
            selected={new Date(endTime)}
            onChange={(date) =>
              onChange('endTime', new Date(date || 0).getTime())
            }
            className="bg-base-200 !p-3 rounded-lg w-full"
            dateFormat={'dd/MM/yyyy, HH:mm'}
            showTimeInput
            showTimeSelect
            placeholderText="Select time"
          />
        </div>
      </div>
      {/* Chart */}
      <div className="col-span-full flex flex-col gap-2">
        <p className="text-sm">Preview</p>
        <LaunchpadChartInit
          startTime={startTime}
          endTime={endTime}
          startPrice={startPrice}
          endPrice={endPrice}
          mint={mint}
          baseMint={stableMint}
          balanceA={amount}
          balanceB={projectInfo.baseAmount}
        />
      </div>
      {/* Action */}
      <div className="col-span-full grid grid-cols-12 gap-3">
        <button className="col-span-6 btn btn-block" onClick={onBack}>
          Back
        </button>
        <button
          onClick={onInitLaunchpad}
          disabled={disabled}
          className="col-span-6 btn btn-primary btn-block"
        >
          {loading && <span className="loading loading-spinner loading-xs" />}
          Create
        </button>
      </div>
    </div>
  )
}
