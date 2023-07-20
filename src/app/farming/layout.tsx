import { ReactNode } from 'react'

export default function FarmingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-full rounded-3xl bg-swap-light dark:bg-swap-dark bg-center bg-cover transition-all p-4 gap-4">
      <div className="flex flex-row justify-center">
        <div className="max-w-[1024px] w-full grid grid-cols-12 gap-x-2 gap-y-4">
          <div className="col-span-full">{children}</div>
        </div>
      </div>
    </div>
  )
}
