'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

import ListApp from './listApp'
import ListPartner from './listPartner'
import ListSocial from './listSocial'
import ElementIObs from '@/components/IntersectionObserver'

import { screenLaptop, screenMobile } from '@/static/images/systems'
import './index.scss'

export default function Welcome() {
  const imageZoomRef = useRef<HTMLDivElement>(null)
  const [innerWidth, setInnerWidth] = useState(0)

  const screenImage = innerWidth > 768 ? screenLaptop : screenMobile

  useEffect(() => {
    const width = window.innerWidth
    setInnerWidth(width)
  }, [])

  return (
    <div className="home-container">
      <section className="section-screen">
        <div className="zoom-image">
          <div className="wrap-image">
            <Image alt="" src={screenImage} />
          </div>
        </div>
        <div className="start-scroll"></div>
        <div className="stop-scroll" ref={imageZoomRef}></div>
      </section>

      <section className="bg-center bg-cover bg-home h-full">
        <ListApp />
      </section>
      <section className="w-full px-8 pt-32 pb-32 md:pb-10">
        <ListPartner />
      </section>
      <section className="px-8 py-32 md:h-[85vh] xl:h-[60vh] w-full">
        <ListSocial />
      </section>

      <ElementIObs threshold={0.08} force querySelector={imageZoomRef} />
    </div>
  )
}
