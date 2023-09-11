'use client'
import { useCallback, useEffect, useRef, useState } from 'react'

import ListApp from './listApp'
import ListPartner from './listPartner'
import ListSocial from './listSocial'

import './index.scss'

const MAX_SCALE = 1.7
const MIN_SCALE = 0.6
const SCALE_SCROLL_TOP = 800

export default function HomePage() {
  const homeContainerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const [ratio, setRatio] = useState(MAX_SCALE)
  const [offsetTop, setOffsetTop] = useState(0)

  const handleScroll = useCallback(() => {
    if (!homeContainerRef.current || !imageRef.current) return
    const innerHeight = window.innerHeight
    const heightImage = imageRef.current.clientHeight
    const scrollTop = homeContainerRef.current.scrollTop

    const newOffsetTop = (innerHeight - heightImage * ratio) / 2
    const newScale = Math.max(
      MAX_SCALE - scrollTop / SCALE_SCROLL_TOP,
      MIN_SCALE,
    )

    setOffsetTop(newOffsetTop)
    setRatio(newScale)
  }, [ratio])

  useEffect(() => {
    if (!homeContainerRef.current) return () => {}
    homeContainerRef.current.addEventListener('scroll', handleScroll)

    return () =>
      homeContainerRef.current &&
      homeContainerRef.current.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  useEffect(() => {
    setTimeout(() => {
      if (!homeContainerRef.current || !imageRef.current) return
      const innerHeight = window.innerHeight
      const heightImage = imageRef.current.clientHeight
      const offsetTop = (innerHeight - heightImage * MAX_SCALE) / 2

      setOffsetTop(offsetTop)
    }, 300)
  }, [])

  return (
    <div ref={homeContainerRef} className="home-container h-full w-full">
      <section className="flex flex-col items-center h-[300vh] w-full">
        <img
          className="sticky top-1/2"
          ref={imageRef as any}
          src="/home-screen.png"
          style={{
            transform: `scale(${ratio})`,
            willChange: 'transform',
            top: `${offsetTop}px`,
          }}
          alt=""
        />
      </section>
      <section className="bg-center bg-cover bg-home h-full">
        <ListApp />
      </section>
      <section className="w-full px-8 pt-32 pb-32 md:pb-10">
        <ListPartner />
      </section>
      <section className="px-8 py-32 md:p-0 md:h-[85vh] xl:h-[60vh] w-full">
        <ListSocial />
      </section>
    </div>
  )
}
