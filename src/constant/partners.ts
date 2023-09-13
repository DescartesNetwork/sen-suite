import {
  clvDarkSvg,
  clvLightSvg,
  defiLandSvg,
  gateSvg,
  jupiterDarkSvg,
  jupiterLightSvg,
  serumDarkSvg,
  serumLightSvg,
  sypoolSvg,
  logoCoin98Png,
  logoSolSvg,
  logoSolDarkSvg,
  solendLight,
  solendDark,
} from '@/static/images/partners'

type ListPartnerProps = {
  light: {
    logo: string
    description: string
  }[]
  dark: {
    logo: string
    description: string
  }[]
}

export const LIST_PARTNER: ListPartnerProps = {
  light: [
    {
      logo: logoSolSvg,
      description:
        'Solana is a decentralized blockchain built to enable scalable, user-friendly apps for the world.',
    },
    {
      logo: logoCoin98Png,
      description:
        'An All in one DeFi platform to swap, stake, borrow, lend, invest and earn with crypto at ease.',
    },
    {
      logo: serumLightSvg,
      description:
        'Serum brings the speed and convenience of centralized exchanges to DeFi while remaining fully trustless and transparent.',
    },
    {
      logo: solendLight,
      description:
        'Solend is the autonomous interest rate machine for lending on Solana.',
    },
    {
      logo: sypoolSvg,
      description:
        'Sypool is a synthetic asset management protocol. Pool managers manage tokens like mutual fund managers manage assets.',
    },
    {
      logo: jupiterLightSvg,
      description:
        'The key liquidity aggregator and swap infrastructure for Solana. For smart traders who like money.',
    },
    {
      logo: gateSvg,
      description:
        'Your Gateway to Crypto. Trade over 1,400 cryptocurrencies safely, quickly, and easily.',
    },
    {
      logo: defiLandSvg,
      description:
        'DeFi Land is a multi-chain agriculture-simulation game created to gamify Decentralized Finance.',
    },
    {
      logo: clvLightSvg,
      description:
        'CLV Chain is a Substrate-based specialized Layer 1 chain that is EVM compatible and cross-chain interoperable.',
    },
  ],
  dark: [
    {
      logo: logoSolDarkSvg,
      description:
        'Solana is a decentralized blockchain built to enable scalable, user-friendly apps for the world.',
    },
    {
      logo: logoCoin98Png,
      description:
        'An All in one DeFi platform to swap, stake, borrow, lend, invest and earn with crypto at ease.',
    },
    {
      logo: serumDarkSvg,
      description:
        'Serum brings the speed and convenience of centralized exchanges to DeFi while remaining fully trustless and transparent.',
    },
    {
      logo: solendDark,
      description:
        'Solend is the autonomous interest rate machine for lending on Solana.',
    },
    {
      logo: sypoolSvg,
      description:
        'Sypool is a synthetic asset management protocol. Pool managers manage tokens like mutual fund managers manage assets.',
    },
    {
      logo: jupiterDarkSvg,
      description:
        'The key liquidity aggregator and swap infrastructure for Solana. For smart traders who like money.',
    },
    {
      logo: gateSvg,
      description:
        'Your Gateway to Crypto. Trade over 1,400 cryptocurrencies safely, quickly, and easily.',
    },
    {
      logo: defiLandSvg,
      description:
        'DeFi Land is a multi-chain agriculture-simulation game created to gamify Decentralized Finance.',
    },
    {
      logo: clvDarkSvg,
      description:
        'CLV Chain is a Substrate-based specialized Layer 1 chain that is EVM compatible and cross-chain interoperable.',
    },
  ],
}
