import { useCallback, useMemo, useState } from 'react'

import MintInput from './mintInput'
import { Plus } from 'lucide-react'

import { isAddress } from '@/helpers/utils'
import { MintSetup, useInitAndDeletePool } from '@/hooks/pool.hook'
import { usePushMessage } from '@/components/message/store'
import { solscan } from '@/helpers/explorers'

const emptyMint: MintSetup = {
  mintAddress: '',
  weight: '',
  isLocked: false,
}
const MAX_AMOUNT = 8
const MIN_AMOUNT = 2

type SetupTokenProps = {
  setPoolAddress: (val: string) => void
  onNext: () => void
}

const SetupToken = ({ onNext, setPoolAddress }: SetupTokenProps) => {
  const [loading, setLoading] = useState(false)
  const [dataSetup, setDataSetup] = useState<MintSetup[]>([
    emptyMint,
    emptyMint,
  ])
  const pushMessage = usePushMessage()

  const { initPool } = useInitAndDeletePool()
  const onInitPool = useCallback(async () => {
    try {
      setLoading(true)
      const { txId, poolAddress } = await initPool(dataSetup)
      pushMessage(
        'alert-success',
        'Successfully initialize pool. Click here to view on explorer.',
        {
          onClick: () => window.open(solscan(txId || ''), '_blank'),
        },
      )
      setPoolAddress(poolAddress)
      return onNext()
    } catch (er: any) {
      pushMessage('alert-error', er.message)
    } finally {
      setLoading(false)
    }
  }, [initPool, pushMessage, setPoolAddress, onNext, dataSetup])

  const onChangeMint = (
    name: keyof MintSetup,
    value: string | boolean,
    index: number,
  ) => {
    const nextData = JSON.parse(JSON.stringify(dataSetup))
    nextData[index][name] = value
    return setDataSetup(nextData)
  }

  const onDelete = (index: number) => {
    const nextData = JSON.parse(JSON.stringify(dataSetup))
    nextData.splice(index, 1)
    setDataSetup(nextData)
  }

  const onAdd = () => {
    if (dataSetup.length === MAX_AMOUNT) return

    const nextData = JSON.parse(JSON.stringify(dataSetup))
    nextData.push(emptyMint)
    setDataSetup(nextData)
  }

  const ok = useMemo(() => {
    let totalWeight = 0
    for (const { mintAddress, weight } of dataSetup) {
      if (!isAddress(mintAddress) || !Number(weight)) return false
      totalWeight += Number(weight)
    }
    const currAmount = dataSetup.length
    return (
      totalWeight === 100 &&
      currAmount >= MIN_AMOUNT &&
      currAmount <= MAX_AMOUNT
    )
  }, [dataSetup])

  return (
    <div className="grid grid-cols-12 gap-3">
      <div className="col-span-full flex items-center">
        <p className="flex-auto text-sm">Token</p>
        <p className="text-sm">Weight</p>
      </div>
      {dataSetup.map((data, i) => (
        <div className="col-span-full" key={data.mintAddress + i}>
          <MintInput
            setupData={data}
            onChange={(name, val) => onChangeMint(name, val, i)}
            onDelete={() => onDelete(i)}
          />
        </div>
      ))}
      <div className="col-span-full">
        <button
          disabled={dataSetup.length === MAX_AMOUNT}
          onClick={onAdd}
          className="btn btn-ghost btn-sm  rounded-3xl"
        >
          <Plus size={16} />
          Add New
        </button>
      </div>
      <div className="col-span-full mt-2">
        <button
          onClick={onInitPool}
          disabled={!ok}
          className="btn btn-primary w-full"
        >
          {loading && <span className="loading loading-spinner loading-xs" />}
          Supply
        </button>
      </div>
    </div>
  )
}

export default SetupToken
