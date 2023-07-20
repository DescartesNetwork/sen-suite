'use client'

export default function Farming() {
  return (
    <div className="grid grid-cols-12 gap-x-2 gap-y-4">
      <div className="col-span-full card w-full shadow-lg p-4 ring-1 ring-base-100 bg-gradient-to-br from-teal-200 to-lime-200 flex flex-row">
        <div className="flex-auto flex flex-col gap-8">
          <div className="flex flex-row gap-2">
            <h4>Sen Farming</h4>
            <h5 className="opacity-60">v2</h5>
          </div>
          <div className="flex flex-row gap-2">
            <div className="">
              <p>Total Value Locked</p>
              <h5>$2,053.38</h5>
            </div>
            <span className="divider divider-horizontal m-0" />
            <div className="">
              <p>Your Reward</p>
              <h5>$2,053.38</h5>
            </div>
          </div>
        </div>
        <div>Image</div>
      </div>
    </div>
  )
}
