import Image from 'next/image'

import GitHubIcon from '@/static/images/socialsLogo/githubLogo'

import {
  twitterSvg,
  telegramSvg,
  youtubeSvg,
  discordSvg,
} from '../static/images/socialsLogo'

export const SOCIALS = [
  {
    icon: <Image src={twitterSvg} height={53} alt="" />,
    name: 'Twitter',
    url: 'https://twitter.com/SentreProtocol',
  },
  {
    icon: <Image src={discordSvg} height={53} alt="" />,
    name: 'Discord',
    url: 'https://discord.com/invite/VD7UBAp2HN',
  },
  {
    icon: <Image src={telegramSvg} height={53} alt="" />,
    name: 'Telegram',
    url: 'https://t.me/Sentre',
  },
  {
    icon: <GitHubIcon />,
    name: 'GitHub',
    url: 'https://github.com/DescartesNetwork',
  },
  {
    icon: <Image src={youtubeSvg} height={53} alt="" />,
    name: 'Youtube',
    url: 'https://www.youtube.com/channel/UC7P7lwc-6sLEr0yLzWfFUyg',
  },
]
