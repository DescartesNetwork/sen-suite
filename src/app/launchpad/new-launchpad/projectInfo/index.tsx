'use client'
import classNames from 'classnames'
import { useMemo } from 'react'
import { useRouter } from 'next/navigation'

import Socials from './socials'
import VentureCapital, { VC } from './ventureCapital'

import { useGlobalLaunchpad } from '../page'
import { ProjectInfo } from '@/hooks/launchpad.hook'
import { isValidURL } from '@/helpers/utils'

type SetUpProjectInfoProp = {
  onNext: () => void
}

export default function SetUpProjectInfo({ onNext }: SetUpProjectInfoProp) {
  const [launchpadData, setLaunchpadData] = useGlobalLaunchpad()
  const { projectName, description, socials } = launchpadData.projectInfo
  const { whitepaper, github, website, vCs } = launchpadData.projectInfo
  const { push } = useRouter()

  const onChangeInfo = (name: keyof ProjectInfo, value: string) => {
    const nextProjectInfo = {
      ...launchpadData.projectInfo,
      [name]: value,
    }
    return setLaunchpadData({ ...launchpadData, projectInfo: nextProjectInfo })
  }

  const onChangeSocials = (socials: string[]) => {
    const nextData = { ...launchpadData }
    const nextProjectInfo = { ...launchpadData.projectInfo, socials }
    return setLaunchpadData({ ...nextData, projectInfo: nextProjectInfo })
  }

  const onChangeVC = (vCs: VC[]) => {
    const nextData = { ...launchpadData }
    const nextProjectInfo = { ...launchpadData.projectInfo, vCs }
    return setLaunchpadData({ ...nextData, projectInfo: nextProjectInfo })
  }

  const error = useMemo(() => {
    if (socials.length > 1)
      for (const social of socials)
        if (!isValidURL(social)) return 'Invalid social address!'
    if (!projectName || projectName.length > 20)
      return 'Project name cannot be empty and must be less than 20 characters!'
    if (!description || description.length > 150)
      return 'Description cannot be empty and must be less than 150 characters!'
    if (!website || !isValidURL(website)) return 'Invalid website address'
    if (!whitepaper || !isValidURL(whitepaper))
      return 'Invalid whitepaper address'
    if (!github || !isValidURL(github)) return 'Invalid github address'
    return ''
  }, [description, github, projectName, socials, website, whitepaper])

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-full flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <p className="text-sm">Project name</p>
          <p
            className={classNames('text-sm opacity-60', {
              'text-primary !opacity-100': projectName.length > 20,
            })}
          >
            {projectName.length}/20 characters
          </p>
        </div>
        <input
          className="input bg-base-200"
          placeholder="Input your project name"
          value={projectName}
          onChange={(e) => onChangeInfo('projectName', e.target.value)}
        />
      </div>
      <div className="col-span-full flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <p className="text-sm">Description</p>
          <p
            className={classNames('text-sm opacity-60', {
              'text-primary !opacity-100': description.length > 150,
            })}
          >
            {description.length}/150 characters
          </p>
        </div>
        <textarea
          className="textarea bg-base-200"
          placeholder="Summarize about your project..."
          rows={4}
          value={description}
          onChange={(e) => onChangeInfo('description', e.target.value)}
        />
      </div>
      <div className="col-span-full flex flex-col gap-2">
        <p className="text-sm">Website</p>
        <input
          className="input bg-base-200"
          placeholder="Input link"
          value={website}
          onChange={(e) => onChangeInfo('website', e.target.value)}
        />
      </div>
      <div className="col-span-full flex flex-col gap-2">
        <p className="text-sm">Whitepaper</p>
        <input
          className="input bg-base-200"
          placeholder="Input link"
          value={whitepaper}
          onChange={(e) => onChangeInfo('whitepaper', e.target.value)}
        />
      </div>
      <div className="col-span-full flex flex-col gap-2">
        <p className="text-sm">Github</p>
        <input
          className="input bg-base-200"
          placeholder="Input link"
          value={github}
          onChange={(e) => onChangeInfo('github', e.target.value)}
        />
      </div>
      <div className="col-span-full">
        <VentureCapital vCs={vCs} onChangeVC={onChangeVC} />
      </div>
      <div className="col-span-full">
        <Socials socials={socials} onChangeSocials={onChangeSocials} />
      </div>
      <div className="col-span-full grid grid-cols-12 gap-3">
        <button
          className="col-span-6 btn btn-block"
          onClick={() => push('/launchpad')}
        >
          Cancel
        </button>
        <button
          onClick={onNext}
          className="col-span-6 btn btn-primary btn-block"
          disabled={!!error}
        >
          {error ? error : 'Continue'}
        </button>
      </div>
    </div>
  )
}
