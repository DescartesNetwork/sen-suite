import { ReactNode } from 'react'

export default function LaunchpadDetailLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="w-full h-full flex flex-col items-center">{children}</div>
  )
}
