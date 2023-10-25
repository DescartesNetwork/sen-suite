import { ReactNode } from 'react'

export default function PoolDetailLayout({
  children,
}: {
  children: ReactNode
}) {
  return <div className="w-full">{children}</div>
}
