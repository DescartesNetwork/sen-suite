'use client'
import { useMemo } from 'react'
import Image from 'next/image'
import dayjs from 'dayjs'

import Resource from './resource'
import { MintName, MintSymbol } from '@/components/mint'
import SocialInfo from '@/app/launchpad/launchpadCard/socialInfo'

import { useMints } from '@/hooks/spl.hook'
import { undecimalize } from '@/helpers/decimals'
import { isValidURL, numeric, shortenAddress } from '@/helpers/utils'
import { useLaunchpadMetadata } from '@/hooks/launchpad.hook'
import { useLaunchpadByAddress } from '@/providers/launchpad.provider'

type ProjectInfoProps = {
  launchpadAddress: string
}

export default function ProjectInfo({ launchpadAddress }: ProjectInfoProps) {
  const projectInfo = useLaunchpadMetadata(launchpadAddress)
  const { mint, startReserves, startTime, endTime } =
    useLaunchpadByAddress(launchpadAddress)
  const mintAddress = mint.toBase58()
  const [mintInfo] = useMints([mintAddress])

  const decimals = useMemo(() => mintInfo?.decimals || 0, [mintInfo?.decimals])
  const tokenSupply = useMemo(
    () => (mintInfo && Number(undecimalize(mintInfo.supply, decimals))) || 0,
    [decimals, mintInfo],
  )
  const reserveAskNum = useMemo(
    () => startReserves && Number(undecimalize(startReserves[0], decimals)),
    [decimals, startReserves],
  )

  const onRedirect = (url?: string) => {
    if (!url || !isValidURL(url)) return
    return window.open(url, '_blank')
  }

  return (
    <div className="flex flex-col gap-6 ">
      <Resource launchpadAddress={launchpadAddress} />

      {/* Description */}
      <div className="flex flex-col gap-2">
        <p className="text-base font-bold">Description</p>
        <p className="text-sm">{projectInfo?.description}</p>
      </div>

      {/* Token info */}
      <div className="flex flex-col gap-2">
        <p className="text-base font-bold">Token information</p>
        <p className="text-sm ">
          <span className="text-sm opacity-60">Token Name:</span>{' '}
          <MintName mintAddress={mintAddress} /> (
          <MintSymbol mintAddress={mintAddress} />)
        </p>
        <p className="text-sm">
          <span className="text-sm opacity-60">Token Address: </span>
          {shortenAddress(mintAddress)}
        </p>
        <p className="text-sm">
          <span className="text-sm opacity-60">Token supply: </span>
          {numeric(tokenSupply).format('0,0.[0000]')} (
          <MintSymbol mintAddress={mintAddress} />)
        </p>
        <p className="text-sm">
          <span className="text-sm opacity-60">Launchpad supply: </span>
          {reserveAskNum} (<MintSymbol mintAddress={mintAddress} />)
        </p>
        <p className="text-sm">
          <span className="text-sm opacity-60">Launchpad start time: </span>
          {dayjs(startTime.toNumber() * 1000).format('MMM DD, YYYY HH:mm')}
        </p>
        <p className="text-sm">
          <span className="text-sm opacity-60">Launchpad end time: </span>
          {dayjs(endTime.toNumber() * 1000).format('MMM DD, YYYY HH:mm')}
        </p>
      </div>

      {projectInfo && (
        <div className="flex flex-col gap-2">
          <p className="text-base font-bold">Social media</p>
          {projectInfo.socials.map((social, index) => (
            <div key={social} className="flex flex-row items-center gap-4">
              <div
                onClick={() => onRedirect(social)}
                className="flex items-center cursor-pointer"
              >
                <SocialInfo key={social} url={social} showName />
              </div>
              {/* Divide line */}
              {index !== projectInfo.socials.length - 1 && (
                <div className="w-[1px] h-4 bg-[--opaline-line]" />
              )}
            </div>
          ))}
        </div>
      )}
      {projectInfo && !!projectInfo.vCs.length && (
        <div className="flex flex-col gap-2">
          <p className="text-base font-bold">Leading venture capital</p>
          {projectInfo.vCs.map(({ link, logo }, index) => {
            if (!link) return null
            return (
              <div key={link} className="flex flex-row items-center gap-4">
                <div className="flex flex-row items-center gap-2 cursor-pointer">
                  <Image
                    className="rounded-full"
                    src={logo}
                    height={21}
                    width={21}
                    alt=""
                  />
                  <p className="text-sm">{link}</p>
                </div>
                {/* Divide line */}
                {index !== projectInfo.socials.length - 1 && (
                  <div className="w-[1px] h-4 bg-[--opaline-line]" />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
