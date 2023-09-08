import Link from 'next/link'
import { useEffect, useRef } from 'react'

const ROUTE_APPS = [
  { route: '/swap', name: 'Swap' },
  { route: '/pools', name: 'Liquidity Pool' },
  { route: '/farming', name: 'Farming' },
  { route: '/airdrop/bulk-sender', name: 'Bulk Sender' },
  { route: '/airdrop/merkle-distribution', name: 'Merkle Distribution' },
  { route: '/launchpad', name: 'Launchpad' },
]

type RouteAppProps = {
  route: string
  name: string
  urlIcon: string
}

const RouteApp = ({ route, name, urlIcon }: RouteAppProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <Link
        href={route}
        className="flex items-center rounded-full h-48 w-48 z-10 p-6 bg-[--card-home] hover:border-accent border-2"
      >
        <img src={urlIcon} alt="" />
      </Link>
      <p className="text-3xl text-center font-semibold">{name}</p>
    </div>
  )
}

export default function Navigation() {
  const bodyNavigationRef = useRef<HTMLDivElement>()
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active')
          } else {
            entry.target.classList.remove('active')
          }
        })
      },
      {
        threshold: 0.5,
      },
    )
    if (!bodyNavigationRef.current) return
    observer.observe(bodyNavigationRef.current)

    return () =>
      bodyNavigationRef.current && observer.unobserve(bodyNavigationRef.current)
  }, [bodyNavigationRef])

  return (
    <div ref={bodyNavigationRef as any} className="body-navigation gap-8">
      <div className="grid grid-cols-3 gap-16 topApp-up">
        {ROUTE_APPS.slice(0, 3).map(({ route, name }) => (
          <div key={route} className="w-52 gap-2">
            <RouteApp route={route} name={name} urlIcon="/icon-app.png" />
          </div>
        ))}
      </div>
      <div className="flex flex-col justify-center items-center gap-4">
        <h3 className="title-up">Let&apos;s explore Sen Suite</h3>
        <p className="desc-up">The limit breaker for projects on Solana.</p>
      </div>
      <div className="grid grid-cols-3 gap-16 bottomApp-down">
        {ROUTE_APPS.slice(3, 6).map(({ route, name }) => (
          <div key={route} className="w-52 gap-2">
            <RouteApp route={route} name={name} urlIcon="/icon-app.png" />
          </div>
        ))}
      </div>
    </div>
  )
}
