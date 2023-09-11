import { ReactNode, useRef } from 'react'
import Link from 'next/link'

import ElementIObs from '@/components/IntersectionObserver'

import { SOCIALS } from '@/constant'

type SocialProps = {
  icon: ReactNode
  name: string
  url: string
}
const Social = ({ icon, name, url }: SocialProps) => {
  return (
    <Link
      href={url}
      className="center gap-6 p-6 w-full md:w-52 h-44 bg-base-100 rounded-3xl"
    >
      {icon}
      <p className="text-center">{name}</p>
    </Link>
  )
}

export default function ListSocial() {
  const listSocialRef = useRef<HTMLDivElement | null>(null)

  return (
    <div ref={listSocialRef} className="socials center h-full w-full gap-16">
      <h3 className="title-socials">Get in touch</h3>
      <div className="list-social w-full md:w-max grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-6 place-items-center">
        {SOCIALS.map(({ icon, name, url }) => (
          <div key={name} className="w-full">
            <Social icon={icon} name={name} url={url} />
          </div>
        ))}
      </div>
      {listSocialRef.current && (
        <ElementIObs querySelector={listSocialRef.current} />
      )}
    </div>
  )
}
