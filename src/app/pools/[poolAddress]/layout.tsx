import { ReactNode } from 'react'

import { StatProvider } from '@/providers/pools.provider'

const PoolDetailLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="w-full">
      <StatProvider>{children}</StatProvider>
    </div>
  )
}

export default PoolDetailLayout
