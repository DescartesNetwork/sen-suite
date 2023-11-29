'use client'
import Welcome from './welcome'
import ScrollButton from '../components/scrollButton'

export default function Home() {
  return (
    <div className="home-page w-full h-full rounded-3xl bg-cover bg-swap-light dark:bg-swap-dark">
      <Welcome />
      <div id="isHidden" className="pos-center">
        <ScrollButton />
      </div>
    </div>
  )
}
