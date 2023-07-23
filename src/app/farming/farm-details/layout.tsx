import { ReactNode } from 'react'
import FarmDetailsNavigation from './navigation'

export default function FarmDetailsLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="card p-4 bg-base-100 grid grid-cols-12 gap-4">
      <div className="col-span-full">
        <FarmDetailsNavigation />
      </div>
      <div className="col-span-full">{children}</div>
    </div>
  )
}
