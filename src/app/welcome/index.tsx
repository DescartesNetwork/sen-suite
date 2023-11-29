'use client'
import Description from './description'
import ListApp from './listApp'
import ListPartner from './listPartner'
import ListSocial from './listSocial'
import Banner from './banner'

import './index.scss'

export default function Welcome() {
  return (
    <div className="welcome-container no-scrollbar">
      <section className="w-full">
        <Banner />
      </section>
      <section className="w-full">
        <Description />
      </section>
      <section className="w-full">
        <ListApp />
      </section>
      <section className="w-full">
        <ListPartner />
      </section>
      <section className="w-full">
        <ListSocial />
      </section>
      <section className="pos-center p-6">
        <p className="opacity-60 text-black">
          Sentre © 2023, All Rights Reserved.
        </p>
      </section>
    </div>
  )
}
