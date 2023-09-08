import { useState } from 'react'
import classNames from 'classnames'

import { Info } from 'lucide-react'

import solConfig from '@/configs/sol.config'
import { solscan } from '@/helpers/explorers'
import { usePushMessage } from '@/components/message/store'
import { usePoolByAddress } from '@/providers/pools.provider'
import { PRECISION, usePoolManagement } from '@/hooks/pool.hook'

const taxmanAddress = solConfig.taxman

const Content = ({
  title,
  percent,
  currentPercent,
  onChangeValue = () => {},
  tooltipContent,
  disabled,
}: {
  title: string
  percent: number | string
  currentPercent: number
  onChangeValue?: (percent: string) => void
  tooltipContent: string
  disabled?: boolean
}) => (
  <div className="flex flex-col gap-4 ">
    <div className="flex flex-row justify-between items-center">
      <div className="flex flex-row gap-2">
        <p className="text-sm">{title} (%)</p>
        <div className="tooltip" data-tip={tooltipContent}>
          <Info className="w-3 h-3" />
        </div>
      </div>
      <div className="flex flex-row gap-1">
        <p className="text-sm opacity-60 ">Current {title}:</p>
        <p className="text-sm">{currentPercent}%</p>
      </div>
    </div>
    <input
      type="number"
      placeholder="0"
      disabled={disabled}
      value={percent}
      onChange={(e) => onChangeValue(e.target.value)}
      className={classNames(
        'input p-4 text-sm bg-base-200 w-full rounded-full focus:outline-none',
        {
          'cursor-not-allowed opacity-60': disabled,
        },
      )}
    />
  </div>
)

const Fee = ({ poolAddress }: { poolAddress: string }) => {
  const poolData = usePoolByAddress(poolAddress)

  const currentFee = (poolData.fee.toNumber() * 100) / PRECISION
  const currentTaxFee = (poolData.taxFee.toNumber() * 100) / PRECISION

  const [fee, setFee] = useState(currentFee.toString())
  const [taxFee, setTaxFee] = useState(currentTaxFee.toString())

  const [loading, setLoading] = useState(false)

  const { updateFee } = usePoolManagement(poolAddress)
  const pushMessage = usePushMessage()

  const onUpdateFee = async () => {
    setLoading(true)
    try {
      const txId = await updateFee(fee, taxFee)
      return pushMessage('alert-success', 'Successfully Update Fee', {
        onClick: () => window.open(solscan(txId || ''), '_blank'),
      })
    } catch (err: any) {
      pushMessage('alert-error', err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Content
        title="LP Reward Rate"
        percent={fee}
        currentPercent={currentFee}
        onChangeValue={setFee}
        tooltipContent={
          'The portion of trading fee a liquidity provider earns upon depositing into the pool'
        }
      />

      <Content
        title="Platform Fee"
        percent={taxFee}
        currentPercent={currentTaxFee}
        onChangeValue={setTaxFee}
        tooltipContent={
          'The portion of fee your pool will pay to Balansol for maintaining the system'
        }
        disabled={poolData.authority.toBase58() !== taxmanAddress}
      />

      <button
        disabled={
          fee === currentFee.toString() && taxFee === currentTaxFee.toString()
        }
        onClick={onUpdateFee}
        className="btn btn-primary w-full rounded-full"
      >
        {loading && <span className="loading loading-spinner" />}
        Update
      </button>
    </div>
  )
}
export default Fee
