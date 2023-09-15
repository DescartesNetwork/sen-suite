'use client'
import { useRef } from 'react'

import ListApp from './listApp'
import ListPartner from './listPartner'
import ListSocial from './listSocial'
import ElementIObs from '@/components/IntersectionObserver'

import './index.scss'

export default function Welcome() {
  const imageZoomRef = useRef<HTMLDivElement>(null)

  return (
    <div className="welcome-container no-scrollbar">
      <section className="section-screen bg-cover bg-swap-light dark:bg-swap-dark z-20 no-scrollbar">
        <div className="zoom-image">
          <div className="wrap-image">
            <div className="dark:bg-[url('/mobile-dark.png')] bg-[url('/mobile-light.png')] dark:md:bg-[url('/laptop-dark.png')] md:bg-[url('/laptop-light.png')] bg-contain bg-no-repeat bg-center w-full aspect-[2/4] md:aspect-[5/5]" />
          </div>
        </div>
        <div className="start-scroll" />
        <div className="stop-scroll" ref={imageZoomRef} />
      </section>

      <section className="w-full relative mt-[-100vh] z-10">
        <ListApp />
      </section>
      <section className="w-full relative mt-[-100vh]">
        <ListPartner />
      </section>
      <section className="w-full">
        <ListSocial />
      </section>
      <section className="pos-center p-6">
        <p className="opacity-60 text-secondary-content">
          Sentre © 2023, All Rights Reserved
        </p>
      </section>

      <ElementIObs threshold={0.08} force querySelector={imageZoomRef} />
    </div>
  )
}
