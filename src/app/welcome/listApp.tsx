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
} from '@/static/images/appsIcon'

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
        className="center rounded-full p-4 md:p-6 bg-[--opaline] hover:border-accent border-2"
      >
        <Image className="h-20 w-20 md:h-36 md:w-36" src={icon} alt="" />
      </Link>
      <p className="text-2xl max-w-[12rem] text-black text-center font-semibold">
        {name}
      </p>
    </div>
  )
}

export default function ListApp() {
  const listAppRef = useRef<HTMLDivElement | null>(null)

  return (
    <div ref={listAppRef} className="list-app gap-10">
      <div className="flex flex-row justify-center gap-10 md:gap-16 top-app">
        {TOP_APPS.map(({ route, name, icon }) => (
          <App key={route} route={route} name={name} icon={icon} />
        ))}
      </div>
      <div className="center gap-4">
        <h3 className="title-apps text-black">Let&apos;s explore Sen Suite</h3>
        <p className="desc-apps opacity-60 text-black">
          The limit breaker for projects on Solana.
        </p>
      </div>
      <div className="flex flex-row justify-center gap-10 md:gap-16 bottom-app">
        {BOTTOM_APPS.map(({ route, name, icon }) => (
          <App key={route} route={route} name={name} icon={icon} />
        ))}
      </div>
      <ElementIObs threshold={0.2} querySelector={listAppRef} />
    </div>
  )
}
