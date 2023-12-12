'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'

export default function Banner() {
  const scrollBtnActiveRef = useRef<HTMLDivElement | null>(null)
  gsap.registerPlugin(ScrollTrigger)

  useEffect(() => {
    const effectImage = document.querySelector('#banner-image')
    const animationScroll = gsap
      .timeline({
        scrollTrigger: {
          start: 'top top',
          end: 'bottom 80%',
          scroller: '.welcome-container',
          scrub: 0.2,
          onLeave: () =>
            scrollBtnActiveRef.current?.classList.add('hidden-scroll'),
          onEnterBack: () =>
            scrollBtnActiveRef.current?.classList.remove('hidden-scroll'),
        },
        defaults: { duration: 1 },
      })
      .to(effectImage, { scale: 0.25 }, 0)

    return () => {
      animationScroll.kill()
    }
  }, [])

  return (
    <div className="banner">
      <div className="zoom-image">
        <div className="wrap-image">
          <div
            id="banner-image"
            className="dark:bg-[url('/mobile-dark.png')] bg-[url('/mobile-light.png')] dark:md:bg-[url('/laptop-dark.png')] md:bg-[url('/laptop-light.png')] bg-contain bg-no-repeat bg-center pos-center gap-2 w-full aspect-[1/4] md:aspect-[5/5]"
          >
            <h2 className="text-black text-4xl sm:text-5xl md:text-4xl lg:text-6xl">
              Sentre Protocol
            </h2>
            <p className="text-black text-xl sm:text-3xl md:text-2xl lg:text-4xl mb-16 md:mb-20">
              The Suite for Startups on Solana
            </p>
          </div>
        </div>
      </div>
      <div className="h-[140dvh] md:h-[50dvh]" ref={scrollBtnActiveRef} />
    </div>
  )
}
