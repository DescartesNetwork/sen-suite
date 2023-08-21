import { useState } from 'react'

import Weight from './weight'
import Fee from './fee'
import FreezeAndThaw from './freezeAndThaw'
import TransferOwner from './transferOwner'

import classNames from 'classnames'

const TABS = [
  {
    key: 'weights',
    title: 'Weights',
  },
  {
    key: 'freezeAndThaw',
    title: 'Freeze/Unfreeze',
  },
  {
    key: 'fee',
    title: 'Fee',
  },
  {
    key: 'ownership',
    title: 'Ownership',
  },
]

const Tab = ({
  activeTab,
  selectTab,
}: {
  activeTab: string
  selectTab: (tabName: string) => void
}) => {
  return (
    <div className="tabs flex-nowrap">
      {TABS.map(({ key, title }) => (
        <div
          key={key}
          onClick={() => selectTab(key)}
          className={classNames('tab tab-bordered', {
            'tab-active ease-in-out duration-300': activeTab === key,
          })}
        >
          {title}
        </div>
      ))}
      {/* Line border bottom tabs */}
      <div className="h-[2px] w-full bg-[#C8CBD3]"></div>
    </div>
  )
}

const PoolManagement = ({ poolAddress }: { poolAddress: string }) => {
  const [activeTab, setActiveTab] = useState('weights')

  const selectTab = (tabName: string) => {
    setActiveTab(tabName)
  }

  return (
    <div className="card rounded-3xl p-6 bg-[#F2F4FA] dark:bg-[#212C4C] flex flex-col gap-4 ">
      <Tab activeTab={activeTab} selectTab={selectTab} />

      <div className={`${activeTab === 'weights' ? 'block' : 'hidden'}`}>
        <Weight poolAddress={poolAddress} />
      </div>
      <div className={`${activeTab === 'freezeAndThaw' ? 'block' : 'hidden'}`}>
        <FreezeAndThaw poolAddress={poolAddress} />
      </div>
      <div className={`${activeTab === 'fee' ? 'block' : 'hidden'}`}>
        <Fee poolAddress={poolAddress} />
      </div>
      <div className={`${activeTab === 'ownership' ? 'block' : 'hidden'}`}>
        <TransferOwner poolAddress={poolAddress} />
      </div>
    </div>
  )
}

export default PoolManagement
