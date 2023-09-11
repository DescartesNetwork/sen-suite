import { useRef } from 'react'
import Image from 'next/image'

import ElementIObs from '@/components/IntersectionObserver'

import { LIST_PARTNER } from '@/constant/partners'
import { useTheme } from '@/providers/ui.provider'

type PartnerProps = {
  logo: string
  description: string
}

const Partner = ({ logo, description }: PartnerProps) => {
  return (
    <div className="flex flex-col items-center gap-6 p-6 w-full md:w-[23rem] h-52 bg-base-100 rounded-3xl">
      <Image src={logo} height={48} alt="" />
      <p className="opacity-60 text-center md:text-sm">{description}</p>
    </div>
  )
}
export default function ListPartner() {
  const listPartnerRef = useRef<HTMLDivElement | null>(null)
  const { theme } = useTheme()

  return (
    <div ref={listPartnerRef} className="partners center h-full w-full gap-16">
      <div className="center gap-4">
        <h3 className="title-partners">Our Partner</h3>
        <p className="desc-partners text-2xl opacity-60">
          Join us on our journey to the moon!
        </p>
      </div>
      <div className="list-partner grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 place-items-center">
        {LIST_PARTNER[theme].map(({ logo, description }) => (
          <div key={description} className="w-full">
            <Partner logo={logo} description={description} />
          </div>
        ))}
      </div>
      {listPartnerRef.current && (
        <ElementIObs querySelector={listPartnerRef.current} />
      )}
    </div>
  )
}
