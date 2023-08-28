import { ReactNode } from 'react'

export default function NewFarmLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex justify-center w-full">
      <div className="max-w-[664px] w-full card p-6 bg-base-100 col-span-full">
        {children}
      </div>
    </div>
  )
}
