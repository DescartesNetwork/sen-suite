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
    <div className="description relative">
      <div className="sticky pos-center top-0 left-0 h-[100dvh] w-full gap-10 p-4">
        <h3 className="w-full max-w-[1024px] paragraph">
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
        </h3>
      </div>
      <div className="h-[30vh] w-full" ref={descRef} />
      <div className="h-[100vh] w-full" ref={triggerRef} />
      <div className="h-[30vh] w-full" />
      <ElementIObs threshold={1} force querySelector={descRef} />
    </div>
  )
}
