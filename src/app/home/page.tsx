'use client'
import { useCallback, useEffect, useRef, useState } from 'react'

const MAX_SCALE = 1.6
const MIN_SCALE = 0.7
const SCALE_PERCENT = 800
const BG_POS_SCREEN_MAX = -260
const BG_POS_SCREEN_MIN = 70
const BREAK_VALUE = 2

export default function Home() {
  const [ratioScale, setRatioScale] = useState(MAX_SCALE)
  const [midleScreen, setMidleScreen] = useState(BG_POS_SCREEN_MAX + 'px')
  const mainRef = useRef<HTMLDivElement>()

  const handleScroll = useCallback(() => {
    if (!mainRef.current) return
    const scrollTop = mainRef.current.scrollTop
    const newScale = Math.max(MAX_SCALE - scrollTop / SCALE_PERCENT, MIN_SCALE)
    const bgPosition = Math.min(
      BG_POS_SCREEN_MAX + scrollTop / BREAK_VALUE,
      BG_POS_SCREEN_MIN,
    )
    setMidleScreen(bgPosition + 'px')
    setRatioScale(newScale)
  }, [])

  useEffect(() => {
    if (!mainRef.current) return
    mainRef.current.addEventListener('scroll', handleScroll)

    return () =>
      mainRef.current &&
      mainRef.current.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  return (
    <div ref={mainRef as any} className="main">
      <section
        className="wrap"
        style={{
          backgroundImage: 'url(/home-screen.svg)',
          backgroundSize: `${ratioScale * 100}%`,
          backgroundPosition: `center ${midleScreen}`,
        }}
      />
      <section className="bg-center bg-cover bg-home h-full"></section>
    </div>
  )
}
