import { Fragment, useEffect } from 'react'

type ElementIObsProps = { querySelector: HTMLDivElement }
const ElementIObs = ({ querySelector }: ElementIObsProps) => {
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) =>
      e.target.classList.toggle('active', e.isIntersecting),
    )

    observer.observe(querySelector)
  }, [querySelector])

  return <Fragment />
}

export default ElementIObs
