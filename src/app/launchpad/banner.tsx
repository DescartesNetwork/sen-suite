'use client'
import Link from 'next/link'

export default function Banner() {
  return (
    <div className="w-full bg-[url(/launchpad.png)] bg-cover bg-no-repeat p-8 rounded-3xl flex flex-col gap-3 items-center ">
      <h4 className="text-center text-[#F3F3F5] text-4xl">
        The Native{' '}
        <span className="text-[#081438]">Decentralized Launchpad</span> <br />
        for projects building on Solana
      </h4>
      <p className="text-xl">Full support in project incubation</p>
      <Link href="/launchpad/new-launchpad" className="btn btn-success mt-3">
        Create a launchpad
      </Link>
    </div>
  )
}
