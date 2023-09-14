import { useRef } from 'react'
import Image from 'next/image'

import Island from '@/components/island'
import ElementIObs from '@/components/IntersectionObserver'

import { useTheme } from '@/providers/ui.provider'
import { LIST_PARTNER } from '@/constant/partners'

type PartnerProps = {
  logo: string
  description: string
}

function Partner({ logo, description }: PartnerProps) {
  const cardPartnerRef = useRef<HTMLDivElement | null>(null)

  return (
    <div
      ref={cardPartnerRef}
      className="card-partner flex flex-col items-center gap-6 p-6 h-full w-full bg-base-100 rounded-3xl"
    >
      <Island>
        <Image src={logo} height={48} alt="" />
      </Island>
      <p className="opacity-60 text-center md:text-sm">{description}</p>
      <ElementIObs threshold={0.08} force querySelector={cardPartnerRef} />
    </div>
  )
}
export default function ListPartner() {
  const listPartnerRef = useRef<HTMLDivElement | null>(null)
  const { theme } = useTheme()

  return (
    <div className="partners">
      <div className="sticky pos-center gap-16 px-8 pt-32 top-0 left-0 w-full">
        <div className="pos-center gap-4">
          <h3 className="title-partners text-center text-secondary-content">
            Our Partner
          </h3>
          <p className="desc-partners text-center text-secondary-content text-2xl opacity-60">
            Join us on our journey to the moon!
          </p>
        </div>
        <div className="list-partner grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 place-items-center">
          {LIST_PARTNER[theme].map(({ logo, description }) => (
            <Partner key={description} logo={logo} description={description} />
          ))}
        </div>
      </div>
      <div
        ref={listPartnerRef}
        className="h-[100vh] w-full -translate-y-[150vh] md:translate-y-0 check-viewport"
      />
      <ElementIObs threshold={0.5} force querySelector={listPartnerRef} />
    </div>
  )
}
