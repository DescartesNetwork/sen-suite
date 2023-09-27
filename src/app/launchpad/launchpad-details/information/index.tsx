'use client'
import { useMemo, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'

import ProjectInfo from './projectInfo'
import LaunchpadInfo from './launchpadInfo'
import Management from './management'

import { useLaunchpadByAddress } from '@/providers/launchpad.provider'

type InformationProps = {
  launchpadAddress: string
}

export default function Information({ launchpadAddress }: InformationProps) {
  const [activeTab, setActiveTab] = useState('launchpadInfo')
  const { authority } = useLaunchpadByAddress(launchpadAddress)
  const { publicKey } = useWallet()

  const tabItems = useMemo(() => {
    const items = [
      { key: 'launchpadInfo', title: 'Launchpad info' },
      { key: 'projectInfo', title: 'Project info' },
    ]
    if (!!publicKey && publicKey.equals(authority)) {
      items.push({ key: 'manage', title: 'Manage' })
    }
    return items
  }, [authority, publicKey])

  const renderedBodyComponent = useMemo(() => {
    if (activeTab === 'launchpadInfo')
      return <LaunchpadInfo launchpadAddress={launchpadAddress} />
    if (activeTab === 'manage')
      return <Management launchpadAddress={launchpadAddress} />
    return <ProjectInfo launchpadAddress={launchpadAddress} />
  }, [activeTab, launchpadAddress])

  return (
    <div className="card rounded-3xl p-6 bg-[--accent-card] flex flex-col ">
      <div className="tabs flex flex-row">
        {tabItems.map(({ key, title }) => (
          <div
            key={key}
            onClick={() => setActiveTab(key)}
            className={classNames('tab tab-bordered', {
              'tab-active ease-in-out duration-300': activeTab === key,
            })}
          >
            <p className="text-sm">{title}</p>
          </div>
        ))}
        {/* Line border bottom tabs */}
        <div className="flex-auto h-[2px] w-auto bg-[--opaline-line]" />
      </div>
      <div className="pt-4">{renderedBodyComponent}</div>
    </div>
  )
}
