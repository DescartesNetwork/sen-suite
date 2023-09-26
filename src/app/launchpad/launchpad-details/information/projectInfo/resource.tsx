'use client'
import { BookOpen, Github, Globe } from 'lucide-react'

import { useLaunchpadMetadata } from '@/hooks/launchpad.hook'

type ResourceProps = {
  launchpadAddress: string
}
export default function Resource({ launchpadAddress }: ResourceProps) {
  const projectInfo = useLaunchpadMetadata(launchpadAddress)

  return (
    <div className="flex flex-row gap-4 items-center">
      <div
        onClick={() => window.open(projectInfo?.website)}
        className="flex flex-row items-center gap-2 cursor-pointer"
      >
        <Globe size={14} />
        <p className="text-sm">Website</p>
      </div>
      <div className="w-[1px] h-4 bg-[#C8CBD3]" />
      <div
        onClick={() => window.open(projectInfo?.whitepaper)}
        className="flex flex-row items-center gap-2 cursor-pointer"
      >
        <BookOpen size={14} />
        <p className="text-sm">Whitepaper</p>
      </div>
      <div className="w-[1px] h-4 bg-[#C8CBD3]" />
      <div
        onClick={() => window.open(projectInfo?.github)}
        className="flex flex-row items-center gap-2 cursor-pointer"
      >
        <Github size={14} />
        <p className="text-sm">Github</p>
      </div>
    </div>
  )
}
