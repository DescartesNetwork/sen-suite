'use client'
import { useMemo, useState } from 'react'
import classNames from 'classnames'

import ProjectInfo from './projectInfo'
import LaunchpadInfo from './launchpadInfo'

type InformationProps = {
  launchpadAddress: string
}

type TabProps = {
  activeTab: string
  setActiveTab: (activeTab: string) => void
}

const TABS = [
  { key: 'launchpadInfo', title: 'Launchpad info' },
  { key: 'projectInfo', title: 'Project info' },
]

const Tab = ({ activeTab, setActiveTab }: TabProps) => {
  return (
    <div className="tabs flex flex-row">
      {TABS.map(({ key, title }) => (
        <div
          key={key}
          onClick={() => setActiveTab(key)}
          className={classNames('tab tab-bordered', {
            'tab-active ease-in-out duration-300': activeTab === key,
          })}
        >
          {title}
        </div>
      ))}
      {/* Line border bottom tabs */}
      <div className="flex-auto h-[2px] w-auto bg-[--opaline-line]" />
    </div>
  )
}

export default function Information({ launchpadAddress }: InformationProps) {
  const [activeTab, setActiveTab] = useState('launchpadInfo')

  const renderedBodyComponent = useMemo(() => {
    if (activeTab === 'launchpadInfo')
      return <LaunchpadInfo launchpadAddress={launchpadAddress} />
    return <ProjectInfo launchpadAddress={launchpadAddress} />
  }, [activeTab, launchpadAddress])

  return (
    <div className="card rounded-3xl p-6 bg-base-100 flex flex-col">
      <Tab activeTab={activeTab} setActiveTab={setActiveTab} />
      <div>{renderedBodyComponent}</div>
    </div>
  )
}
