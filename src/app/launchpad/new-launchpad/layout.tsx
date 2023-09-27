import { ReactNode } from 'react'

export default function NewLaunchpadLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="w-full h-full flex justify-center items-center p-6">
      {children}
    </div>
  )
}
