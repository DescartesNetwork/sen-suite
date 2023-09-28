'use client'
import CategoryTag from './categoryTag'
import SocialInfo from './socialInfo'

import { useLaunchpadMetadata } from '@/hooks/launchpad.hook'

type ProjectProfileProps = {
  launchpadAddress: string
}
export default function ProjectProfile({
  launchpadAddress,
}: ProjectProfileProps) {
  const projectProfile = useLaunchpadMetadata(launchpadAddress)

  return (
    <div className="flex gap-6 items-center">
      <img
        src={projectProfile?.coverPhoto}
        alt="launchpad-img"
        className="h-16 w-16 rounded-lg object-cover"
        onError={({ currentTarget }) => {
          currentTarget.onerror = null // prevents looping
          currentTarget.src = '/panel-light.jpg'
        }}
      />
      <div className="flex flex-col gap-1">
        <p className="font-bold">{projectProfile?.projectName}</p>
        <div className="flex gap-2 items-center">
          {projectProfile?.category.map((tag: any) => (
            <CategoryTag key={tag} category={tag} />
          ))}
        </div>
        <div className="flex gap-2">
          {projectProfile?.socials.map((url) => (
            <button
              onClick={() => window.open(url, '_blank')}
              key={url}
              className="btn btn-square btn-xs"
            >
              <SocialInfo url={url} />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
