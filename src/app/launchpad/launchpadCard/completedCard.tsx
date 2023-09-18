'use client'
import ProjectProfile from './projectProfile'

type CompletedCardProps = {
  launchpadAddress: string
}
export default function CompletedCard({
  launchpadAddress,
}: CompletedCardProps) {
  return (
    <div className="grid grid-cols-12 gap-4 card bg-base-100 p-6 rounded-3xl cursor-pointer border hover:border-[#63E0B3]">
      <div className="col-span-full md:col-span-6">
        <ProjectProfile launchpadAddress={launchpadAddress} />
      </div>
    </div>
  )
}
