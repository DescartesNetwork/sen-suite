import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-row flex-auto w-full h-full rounded-3xl bg-panel-light dark:bg-panel-dark bg-center bg-cover transition-all p-4 items-center gap-4">
      <div className="card w-full glass px-8 py-16 grid grid-cols-12 gap-4">
        <h2 className="col-span-12 text-right tracking-tight">
          The dApp for All Things Solana
        </h2>
        <h5 className="col-span-12 opacity-60 text-right">
          Explore & install DApps on Senhub, build on Sentre, and send your
          project to the moon with Sen Suite.
        </h5>
        <div className="col-span-12 divider pt-16">
          <p className="font-bold opacity-60">Start the journey</p>
        </div>
        <div className="col-span-6 sm:col-span-3">
          <Link className="btn btn-primary w-full" href="/swap">
            Swap
          </Link>
        </div>
        <div className="col-span-6 sm:col-span-3">
          <Link className="btn btn-primary w-full btn-disabled" href="/pool">
            Pool
          </Link>
        </div>
        <div className="col-span-6 sm:col-span-3">
          <Link className="btn btn-primary w-full btn-disabled" href="/farming">
            Farming
          </Link>
        </div>
        <div className="col-span-6 sm:col-span-3">
          <Link className="btn btn-primary w-full btn-disabled" href="/airdrop">
            Airdrop
          </Link>
        </div>
      </div>
    </div>
  )
}
