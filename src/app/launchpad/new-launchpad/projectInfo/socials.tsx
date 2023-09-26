'use client'

import { Plus, Trash } from 'lucide-react'

type SocialsProps = {
  socials: string[]
  onChangeSocials: (socials: string[]) => void
}

export default function Socials({ socials, onChangeSocials }: SocialsProps) {
  const onAddMore = () => {
    const nextData = [...socials]
    nextData.push('')
    return onChangeSocials(nextData)
  }

  const onRemove = (index: number) => {
    const nextData = [...socials]
    nextData.splice(index, 1)
    return onChangeSocials(nextData)
  }

  const onChange = (val: string, index: number) => {
    const nextData = [...socials]
    nextData[index] = val
    return onChangeSocials(nextData)
  }
  return (
    <div className="grid grid-cols-12 gap-2">
      <p className="col-span-full text-sm">Socials (Optional)</p>
      {socials.map((social, index) => (
        <div className="col-span-full flex gap-2 items-center" key={index}>
          <input
            onChange={(e) => onChange(e.target.value, index)}
            placeholder="Input link"
            className="input flex-auto w-full bg-base-200"
            value={social}
          />
          {!!index && (
            <button className="btn  btn-ghost" onClick={() => onRemove(index)}>
              <Trash size={16} />
            </button>
          )}
        </div>
      ))}
      <button
        onClick={onAddMore}
        className="col-span-full btn btn-sm btn-block"
      >
        <Plus size={16} /> Add more
      </button>
    </div>
  )
}
