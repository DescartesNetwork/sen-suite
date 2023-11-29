'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'

import ElementIObs from '@/components/IntersectionObserver'

const PARAGRAPH =
  'full potential with Sentre—Offering swap, airdrop tool, launchpad, and more. Begin scaling your decentralized journey with us today.'

export default function Description() {
  const descRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  gsap.registerPlugin(ScrollTrigger)

  const useArrayRef = () => {
    const descriptionRef = useRef<HTMLSpanElement[]>([])
    descriptionRef.current = []
    return [
      descriptionRef,
      (ref: HTMLSpanElement) => ref && descriptionRef.current.push(ref),
    ] as const
  }
  const [descriptionRef, setDescriptionRef] = useArrayRef()

  useEffect(() => {
    const effectDescription = gsap.to(descriptionRef.current, {
      scrollTrigger: {
        trigger: triggerRef.current,
        scroller: '.welcome-container',
        start: 'top 85%',
        end: 'bottom 85%',
        scrub: true,
      },
      color: '#212433',
      duration: 5,
      stagger: 1,
    })
    return () => {
      effectDescription.kill()
    }
  }, [descriptionRef])

  return (
    <div ref={descRef} className="description relative">
      <div className="sticky pos-center top-0 left-0 h-[calc(100dvh-77px)] md:h-[calc(100dvh-1rem)] w-full gap-10 p-4">
        <p className="w-full max-w-[1024px] font-bold text-2xl md:text-5xl">
          <span className="text-[#212433]">Unlock your project&apos;s </span>
          {PARAGRAPH.split('').map((character, index) => (
            <span
              className="text-[#D3D3D6]"
              key={index}
              ref={(ref: HTMLSpanElement) => setDescriptionRef(ref)}
            >
              {character}
            </span>
          ))}
        </p>
      </div>
      <div className="h-[30vh] w-full" />
      <div className="h-[100vh] w-full" ref={triggerRef} />
      <div className="h-[30vh] w-full" />
      <ElementIObs threshold={0.1} querySelector={descRef} />
    </div>
  )
}
