import { ReactNode } from 'react'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full max-w-[576px] card bg-base-100 rounded-3xl p-6">
      {children}
    </div>
  )
}
