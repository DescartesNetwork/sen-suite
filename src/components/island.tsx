'use client'
import dynamic from 'next/dynamic'
import { Fragment, ReactElement, ReactNode } from 'react'

export type IslandProps = {
  children: ReactNode
  loading?: ReactElement
}

export default function Island({
  children,
  loading = <Fragment />,
}: IslandProps) {
  const Lazy = dynamic(
    () =>
      Promise.resolve(({ children }: { children: ReactNode }) => {
        return <Fragment>{children}</Fragment>
      }),
    {
      ssr: false,
      loading: () => loading,
    },
  )
  return <Lazy>{children}</Lazy>
}
