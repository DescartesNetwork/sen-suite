import { ReactNode, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'

import GitHubIcon from './githubIcon'
import ElementIObs from '@/components/IntersectionObserver'

import {
  twitterIcon,
  telegramIcon,
  youtubeIcon,
  discordIcon,
} from '@/static/images/welcome/socials'

type SocialProps = {
  icon: ReactNode
  name: string
  url: string
}

const SOCIALS: SocialProps[] = [
  {
    icon: <Image src={twitterIcon} height={53} alt="" />,
    name: 'Twitter',
    url: 'https://twitter.com/SentreProtocol',
  },
  {
    icon: <Image src={discordIcon} height={53} alt="" />,
    name: 'Discord',
    url: 'https://discord.com/invite/VD7UBAp2HN',
  },
  {
    icon: <Image src={telegramIcon} height={53} alt="" />,
    name: 'Telegram',
    url: 'https://t.me/Sentre',
  },
  {
    icon: <GitHubIcon />,
    name: 'GitHub',
    url: 'https://github.com/DescartesNetwork',
  },
  {
    icon: <Image src={youtubeIcon} height={53} alt="" />,
    name: 'Youtube',
    url: 'https://www.youtube.com/channel/UC7P7lwc-6sLEr0yLzWfFUyg',
  },
]

function Social({ icon, name, url }: SocialProps) {
  const cardSocialRef = useRef<HTMLAnchorElement | null>(null)

  return (
    <Link
      href={url}
      ref={cardSocialRef}
      className="card-social pos-center gap-6 p-6 w-full h-full bg-base-100 hover:border-primary border-2 rounded-3xl"
    >
      {icon}
      <p className="text-center">{name}</p>
      <ElementIObs threshold={0.08} force querySelector={cardSocialRef} />
    </Link>
  )
}

export default function ListSocial() {
  const listSocialRef = useRef<HTMLDivElement | null>(null)

  return (
    <div
      ref={listSocialRef}
      className="socials pos-center h-full w-full gap-16 px-8 py-32"
    >
      <h3 className="title-socials text-center text-secondary-content">
        Get in touch
      </h3>
      <div className="list-social text-center text-secondary-content w-full grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-6">
        {SOCIALS.map(({ icon, name, url }) => (
          <Social key={name} icon={icon} name={name} url={url} />
        ))}
      </div>
      <ElementIObs threshold={0.1} force querySelector={listSocialRef} />
    </div>
  )
}
