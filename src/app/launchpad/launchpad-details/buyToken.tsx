'use client'

type BuyTokenProps = {
  launchpadAddress: string
}
export default function BuyToken({ launchpadAddress }: BuyTokenProps) {
  return (
    <div className="card rounded-3xl p-6 bg-[--accent-card] flex flex-col gap-4 ">
      Buy Token
    </div>
  )
}
