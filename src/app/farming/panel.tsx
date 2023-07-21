'use client'

export default function FarmingPanel() {
  return (
    <div className="card w-full shadow-lg p-8 ring-1 ring-base-100 bg-gradient-to-br from-lime-200 to-teal-300 flex flex-row-reverse flex-wrap gap-x-2 gap-y-16 justify-center">
      <div className="w-48 relative -mb-4">
        <img
          className="w-full"
          src="/farming-illustration.png"
          alt="farming-illustration"
        />
        <img
          className="absolute -top-6 left-4 animate-bounce"
          src="/farming-coin-1.svg"
          alt="farming-coin-1"
        />
        <img
          className="absolute -top-12 right-2 animate-bounce"
          src="/farming-coin-2.svg"
          alt="farming-coin-2"
        />
      </div>
      <div className="flex-auto flex flex-col gap-8 text-slate-800">
        <div className="flex flex-row gap-2">
          <h4>Sen Farming</h4>
          <h5 className="opacity-60">v2</h5>
        </div>
        <div className="flex flex-row gap-2">
          <div className="">
            <p className="text-sm">TVL</p>
            <h5>$2,053.38</h5>
          </div>
          <span className="divider divider-horizontal m-0" />
          <div className="">
            <p className="text-sm">Your Reward</p>
            <h5>$2,053.38</h5>
          </div>
        </div>
      </div>
    </div>
  )
}
