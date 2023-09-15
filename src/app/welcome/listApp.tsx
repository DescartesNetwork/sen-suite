'use client'
import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'

import ElementIObs from '@/components/IntersectionObserver'

import {
  booster,
  farming,
  launchpad,
  merkleDistribution,
  swap,
} from '@/static/images/welcome/appsIcon'

const TOP_APPS = [
  { route: '/swap', name: 'Swap', icon: swap },
  { route: '/academy', name: 'Booster', icon: booster },
  { route: '/farming', name: 'Farming', icon: farming },
]

const BOTTOM_APPS = [
  {
    route: '/airdrop/merkle-distribution',
    name: 'Merkle Distribution',
    icon: merkleDistribution,
  },
  { route: '/launchpad', name: 'Launchpad', icon: launchpad },
]

type AppProps = {
  route: string
  name: string
  icon: string
}

const App = ({ route, name, icon }: AppProps) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <Link
        href={route}
        className="pos-center rounded-full p-4 md:p-6 bg-[--opaline] hover:border-primary border-2"
      >
        <Image className="h-20 w-20 md:h-36 md:w-36" src={icon} alt="" />
      </Link>
      <p className="text-2xl max-w-[9rem] md:max-w-[12rem] text-black text-center font-semibold">
        {name}
      </p>
    </div>
  )
}

export default function ListApp() {
  const listAppRef = useRef<HTMLDivElement | null>(null)

  return (
    <div className="list-app relative">
      <div className="sticky pos-center top-0 left-0 h-[100vh] md:h-[120vh] w-full gap-10 bg-center bg-no-repeat bg-cover bg-apps">
        <div className="top-apps flex flex-row justify-center gap-5 md:gap-16 ">
          {TOP_APPS.map(({ route, name, icon }) => (
            <App key={route} route={route} name={name} icon={icon} />
          ))}
        </div>
        <div className="pos-center gap-4">
          <h3 className="title-apps text-center text-black">
            Let&apos;s explore Sen Suite
          </h3>
          <p className="desc-apps text-center opacity-60 text-black">
            The limit breaker for projects on Solana.
          </p>
        </div>
        <div className="bottom-apps flex flex-row justify-center gap-7 md:gap-16">
          {BOTTOM_APPS.map(({ route, name, icon }) => (
            <App key={route} route={route} name={name} icon={icon} />
          ))}
        </div>
      </div>
      <div ref={listAppRef} className="h-[100vh] w-full" />
      <ElementIObs threshold={0.6} force querySelector={listAppRef} />
    </div>
  )
}
