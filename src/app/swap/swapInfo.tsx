import { useSwapStore } from '@/hooks/swap.hook'

function PriceImpact() {
  return (
    <div className="flex flex-row gap-2 items-baseline">
      <p className="flex-auto text-sm opacity-60">Price Impact</p>
      <p className="text-sm font-bold">0.045%</p>
    </div>
  )
}

function Price() {
  return (
    <div className="flex flex-row gap-2 items-baseline">
      <p className="flex-auto text-sm opacity-60">Price</p>
      <p className="text-sm font-bold">$50</p>
    </div>
  )
}

function SlippageTolerance() {
  const slippage = useSwapStore(({ slippage }) => slippage)
  const value = slippage === 1 ? 'Free' : `${slippage * 100}%`
  let className = 'badge'
  if (slippage >= 1) className = className + ' badge-error'
  else if (slippage >= 0.05) className = className + ' badge-warning'
  else className = className + ' badge-success'

  return (
    <div className="flex flex-row gap-2 items-baseline">
      <p className="flex-auto text-sm opacity-60">Slippage Tolerance</p>
      <div className={className}>
        <p className="text-sm font-bold">{value}</p>
      </div>
    </div>
  )
}

function Platform() {
  return (
    <div className="flex flex-row gap-2 items-baseline">
      <p className="flex-auto text-sm opacity-60">Platform</p>
      <p className="text-sm font-bold">Sentre | Jupiter</p>
    </div>
  )
}

export default function SwapInfo() {
  return (
    <div className="card bg-base-100 p-4 rounded-3xl grid grid-cols-12 gap-x-2 gap-y-4">
      <div className="col-span-12">
        <Price />
      </div>
      <div className="col-span-12">
        <PriceImpact />
      </div>
      <div className="col-span-12">
        <SlippageTolerance />
      </div>
      <div className="col-span-12">
        <Platform />
      </div>
    </div>
  )
}
