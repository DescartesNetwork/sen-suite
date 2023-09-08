'use client'
import { useCallback, useEffect, useRef, useState } from 'react'

import Navigation from './navigation'

import './index.scss'

const LARGE_SCALE = 1.3
const SMALL_SCALE = 0.6
const SCALE_SCROLLTOP = 800
const OFFSET_TOP_SCREEN_LARGE = -110
const OFFSET_TOP_SCREEN_SMALL = 150
const BREAK_SCROLLTOP_VALUE = 2

export default function Home() {
  const [ratio, setRatio] = useState(LARGE_SCALE)
  const [offsetTopScreen, setOffsetTopScreen] = useState(
    OFFSET_TOP_SCREEN_LARGE,
  )
  const bodyHomeRef = useRef<HTMLDivElement>()

  const handleScroll = useCallback(() => {
    if (!bodyHomeRef.current) return
    const scrollTop = bodyHomeRef.current.scrollTop
    const newScale = Math.max(
      LARGE_SCALE - scrollTop / SCALE_SCROLLTOP,
      SMALL_SCALE,
    )
    const bgPosition = Math.min(
      OFFSET_TOP_SCREEN_LARGE + scrollTop / BREAK_SCROLLTOP_VALUE,
      OFFSET_TOP_SCREEN_SMALL,
    )
    setOffsetTopScreen(bgPosition)
    setRatio(newScale)
  }, [])

  useEffect(() => {
    if (!bodyHomeRef.current) return
    bodyHomeRef.current.addEventListener('scroll', handleScroll)

    return () =>
      bodyHomeRef.current &&
      bodyHomeRef.current.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  return (
    <div ref={bodyHomeRef as any} className="body-home">
      <section
        className="wrap-section"
        style={{
          backgroundImage: 'url(/home-screen.png)',
          backgroundSize: `${ratio * 100}%`,
          backgroundPosition: `center ${offsetTopScreen}px`,
        }}
      />
      <section className="bg-center bg-cover bg-home h-full">
        <Navigation />
      </section>
    </div>
  )
}
