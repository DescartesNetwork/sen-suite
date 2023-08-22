import classNames from 'classnames'

import { Info } from 'lucide-react'

import { StatePool } from '@/hooks/pool.hook'

const CardDescription = ({
  description,
  statusContent,
}: {
  description: string
  statusContent: string
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row gap-4">
        <Info className="w-4 h-4" />
        <p className="text-xs">{description}</p>
      </div>

      <div className="flex flex-row items-center gap-2">
        <div
          className={classNames('badge badge-xs', {
            'badge-primary': statusContent === StatePool.Frozen,
            'bg-[#30A24C]': statusContent === StatePool.Active,
          })}
        />
        <p className="text-sm">Current status: {statusContent}</p>
      </div>
    </div>
  )
}

export default CardDescription
