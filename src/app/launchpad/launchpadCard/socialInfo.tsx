'use client'

import { ReactNode, useMemo } from 'react'
import { Facebook, Globe2, Twitter } from 'lucide-react'

import Image from 'next/image'

import { isValidURL } from '@/helpers/utils'
import { telegramIcon, discordIcon } from '@/static/images/welcome/socials'

const ListSocials: Record<string, { icon: ReactNode; websiteName: string }> = {
  t: {
    icon: <Image src={telegramIcon} height={16} alt="" />,
    websiteName: 'Telegram',
  },
  twitter: { icon: <Twitter size={16} />, websiteName: 'Twitter' },
  facebook: { icon: <Facebook size={16} />, websiteName: 'Facebook' },
  discord: {
    icon: <Image src={discordIcon} height={16} alt="" />,
    websiteName: 'Discord',
  },
  global: { icon: <Globe2 size={16} />, websiteName: 'Social media' },
}

type SocialInfoProps = {
  url: string
  showName?: boolean
}

export default function SocialInfo({ url, showName = false }: SocialInfoProps) {
  const socialInfo = useMemo(() => {
    if (!isValidURL(url)) return ListSocials['global']

    let socialName = ''
    const domain = new URL(url)
    const host = domain.hostname.replace('www.', '')
    for (const char of host) {
      if (char === '.') break
      socialName += char
    }

    const valid = ListSocials[socialName.toLowerCase()]
    if (!valid) socialName = 'global'

    return ListSocials[socialName.toLowerCase()]
  }, [url])

  return (
    <div className="flex items-center gap-2">
      {socialInfo.icon}
      {showName && <p className="text-sm">{socialInfo.websiteName}</p>}
    </div>
  )
}
