'use client'
import { useMemo, useState } from 'react'
import { createGlobalState } from 'react-use'
import classNames from 'classnames'

import SetUpProjectInfo from './projectInfo'
import ProjectCover from './projectCover'
import LaunchpadConfig from './launchpadConfig'

import { LaunchpadInfo, ProjectInfo } from '@/hooks/launchpad.hook'

const DEFAULT_INFO: ProjectInfo = {
  projectName: '',
  description: '',
  website: '',
  github: '',
  whitepaper: '',
  vCs: [{ logo: '', link: '' }],
  socials: [''],
  coverPhoto: '',
  category: [],
  baseAmount: '0',
}

const DEFAULT_LAUNCHPAD: LaunchpadInfo = {
  projectInfo: DEFAULT_INFO,
  mint: '',
  stableMint: '',
  amount: '0',
  fee: '0',
  startPrice: '0',
  endPrice: '0',
  startTime: Date.now(), //now
  endTime: Date.now() + 3 * (24 * 60 * 60 * 1000), // Add more 3 days
}

export const useGlobalLaunchpad =
  createGlobalState<LaunchpadInfo>(DEFAULT_LAUNCHPAD)

const PROJECT_INFO = 0
const PHOTO_COVER = 1
const CONFIG = 2

export default function NewLaunchpad() {
  const [step, setStep] = useState(PROJECT_INFO)

  const renderContent = useMemo(() => {
    switch (step) {
      case PROJECT_INFO:
        return <SetUpProjectInfo onNext={() => setStep(PHOTO_COVER)} />
      case PHOTO_COVER:
        return (
          <ProjectCover
            onBack={() => setStep(PROJECT_INFO)}
            onNext={() => setStep(CONFIG)}
          />
        )
      case CONFIG:
        return <LaunchpadConfig onBack={() => setStep(PHOTO_COVER)} />
    }
  }, [step])

  return (
    <div className="w-full max-w-[660px] card bg-base-100 rounded-3xl p-6 grid grid-cols-12 gap-6">
      <div className="col-span-full">
        <ul className="steps w-full">
          <li
            className={classNames('step', {
              'step-primary': step >= PROJECT_INFO,
            })}
          >
            Project info
          </li>
          <li
            className={classNames('step', {
              'step-primary': step >= PHOTO_COVER,
            })}
          >
            Cover photo
          </li>
          <li
            className={classNames('step', { 'step-primary': step >= CONFIG })}
          >
            Configuration
          </li>
        </ul>
      </div>
      <div className="col-span-full">{renderContent}</div>
    </div>
  )
}
