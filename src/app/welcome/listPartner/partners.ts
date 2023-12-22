'use client'

import {
  clvDarkSvg,
  clvLightSvg,
  defiLandSvg,
  gateSvg,
  jupiterDarkSvg,
  jupiterLightSvg,
  sypoolSvg,
  logoCoin98Png,
  logoSolSvg,
  logoSolDarkSvg,
  solendLight,
  solendDark,
  superteamDark,
  superteamLight,
} from '@/static/images/welcome/partners'

type ListPartnerProps = {
  description: string
  logoLight: string
  logoDark: string
}[]

export const LIST_PARTNER: ListPartnerProps = [
  {
    description:
      'Solana is a decentralized blockchain built to enable scalable, user-friendly apps for the world.',
    logoLight: logoSolSvg,
    logoDark: logoSolDarkSvg,
  },
  {
    description:
      'Superteam Vietnam is a community of founders, builders and creative artists in Vietnam. Our goal is to raise the quality of Vietnamese builders, specifically on Solana blockchain.',
    logoLight: superteamLight,
    logoDark: superteamDark,
  },
  {
    description:
      'An All in one DeFi platform to swap, stake, borrow, lend, invest and earn with crypto at ease.',
    logoLight: logoCoin98Png,
    logoDark: logoCoin98Png,
  },
  {
    description:
      'The key liquidity aggregator and swap infrastructure for Solana. For smart traders who like money.',
    logoLight: jupiterLightSvg,
    logoDark: jupiterDarkSvg,
  },
  {
    description:
      'Your Gateway to Crypto. Trade over 1,400 cryptocurrencies safely, quickly, and easily.',
    logoLight: gateSvg,
    logoDark: gateSvg,
  },
  {
    description:
      'Solend is the autonomous interest rate machine for lending on Solana.',
    logoLight: solendLight,
    logoDark: solendDark,
  },
  {
    description:
      'Sypool is a synthetic asset management protocol. Pool managers manage tokens like mutual fund managers manage assets.',
    logoLight: sypoolSvg,
    logoDark: sypoolSvg,
  },
  {
    description:
      'DeFi Land is a multi-chain agriculture-simulation game created to gamify Decentralized Finance.',
    logoLight: defiLandSvg,
    logoDark: defiLandSvg,
  },
  {
    description:
      'CLV Chain is a Substrate-based specialized Layer 1 chain that is EVM compatible and cross-chain interoperable.',
    logoLight: clvLightSvg,
    logoDark: clvDarkSvg,
  },
]
