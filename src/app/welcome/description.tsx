'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'

const PARAGRAPH =
  'full potential with Sentre—Offering swap, airdrop tool, launchpad, and more. Begin scaling your decentralized journey with us today.'

export default function Description() {
  const triggerRef = useRef<HTMLDivElement>(null)
  const useArrayRef = () => {
    const lettersRef = useRef<HTMLSpanElement[]>([])
    lettersRef.current = []
    return [
      lettersRef,
      (ref: HTMLSpanElement) => ref && lettersRef.current.push(ref),
    ] as const
  }
  const [lettersRef, setLettersRef] = useArrayRef()
  gsap.registerPlugin(ScrollTrigger)

  useEffect(() => {
    const anim = gsap.to(lettersRef.current, {
      scrollTrigger: {
        trigger: triggerRef.current!,
        scroller: '.welcome-container',
        scrub: true,
        start: 'top center',
        end: 'bottom 85%',
      },
      color: '#212433',
      duration: 5,
      stagger: 1,
    })
    return () => {
      anim.kill()
    }
  }, [lettersRef])

  return (
    <div className="description relative">
      <div className="sticky pos-center top-0 left-0 h-[100dvh] w-full gap-10 bg-center bg-no-repeat bg-cover bg-[url('/apps-bg-light.png')] dark:bg-[url('/apps-bg-dark.png')] p-4">
        <h3 className="w-full max-w-[1024px] paragraph">
          <span className="text-[#212433]">Unlock your project&apos;s </span>
          {PARAGRAPH.split('').map((character, index) => (
            <span
              className="text-[#D3D3D6]"
              key={index}
              ref={(ref: HTMLSpanElement) => setLettersRef(ref)}
            >
              {character}
            </span>
          ))}
        </h3>
      </div>
      <div className="h-[50vh] w-full" />
      <div className="h-[100vh] w-full" ref={triggerRef} />
      <div className="h-[30vh] w-full" />
    </div>
  )
}
