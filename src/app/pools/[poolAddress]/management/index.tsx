import { Fragment, Suspense, lazy, useMemo, useState } from 'react'
import classNames from 'classnames'

const TABS = [
  { key: 'weights', title: 'Weights' },
  { key: 'freezeAndThaw', title: 'Freeze/Unfreeze' },
  { key: 'fee', title: 'Fee' },
  { key: 'ownership', title: 'Ownership' },
]

const Tab = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: string
  setActiveTab: (activeTab: string) => void
}) => {
  return (
    <div className="tabs flex-nowrap">
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
      <div className="h-[2px] w-full bg-[#C8CBD3]" />
    </div>
  )
}

const Weight = lazy(() => import('./weight'))
const FreezeAndThaw = lazy(() => import('./freezeAndThaw'))
// const Fee = lazy(() => import('./fee'))
// const TransferOwner = lazy(() => import('./transferOwner'))

const BodyPoolManagement = ({
  activeTab,
  poolAddress,
}: {
  activeTab: string
  poolAddress: string
}) => {
  const renderedComponent = useMemo(() => {
    switch (activeTab) {
      case 'weights':
        return <Weight poolAddress={poolAddress} />
      case 'freezeAndThaw':
        return <FreezeAndThaw poolAddress={poolAddress} />
      //   case 'fee':
      //     return <Fee poolAddress={poolAddress} />
      //   case 'ownership':
      //     return <TransferOwner poolAddress={poolAddress} />
      default:
        return null
    }
  }, [activeTab, poolAddress])

  return <Fragment>{renderedComponent}</Fragment>
}

const PoolManagement = ({ poolAddress }: { poolAddress: string }) => {
  const [activeTab, setActiveTab] = useState('weights')

  return (
    <div className="card rounded-3xl p-6 bg-[#F2F4FA] dark:bg-[#212C4C] flex flex-col gap-4 ">
      <Tab activeTab={activeTab} setActiveTab={setActiveTab} />
      <Suspense>
        <BodyPoolManagement activeTab={activeTab} poolAddress={poolAddress} />
      </Suspense>
    </div>
  )
}

export default PoolManagement
