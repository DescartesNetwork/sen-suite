'use client'
import { ChangeEvent, useRef } from 'react'

import { ImagePlus, Plus, Trash, X } from 'lucide-react'

import { fileToBase64 } from '@/helpers/utils'

export type VC = { logo: string; link: string }

type VentureCapitalProps = {
  vCs: VC[]
  onChangeVC: (vcs: VC[]) => void
}
export default function VentureCapital({
  vCs,
  onChangeVC,
}: VentureCapitalProps) {
  const ref = useRef<HTMLInputElement>(null)

  const onAddMore = () => {
    const nextData = [...vCs]
    nextData.push({ logo: '', link: '' })
    return onChangeVC(nextData)
  }

  const onRemove = (index: number) => {
    const nextData = [...vCs]
    nextData.splice(index, 1)
    return onChangeVC(nextData)
  }

  const onFileChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const [file] = Array.from(e.target.files || [])
    fileToBase64(file, (logo) => onLogoChange(logo, index))
  }

  const onLogoChange = (logo: string, index: number) => {
    const vCInfo: VC = { ...vCs[index], logo }
    const nextData = [...vCs]
    nextData[index] = vCInfo
    return onChangeVC(nextData)
  }

  const onLinkChange = (val: string, index: number) => {
    const nextData = [...vCs]
    nextData[index] = { ...nextData[index], link: val }
    return onChangeVC(nextData)
  }

  const onRemoveLogo = (index: number) => {
    if (ref.current?.value) ref.current.value = ''
    const nextData = [...vCs]
    nextData[index] = { ...nextData[index], logo: '' }
    return onChangeVC(nextData)
  }

  return (
    <div className="grid grid-cols-12 gap-2">
      <p className="col-span-full text-sm">
        Leading venture capital (Optional)
      </p>
      {vCs.map(({ logo, link }, index) => (
        <div className="col-span-full flex gap-2 items-center" key={index}>
          <div className="relative cursor-pointer">
            {logo ? (
              <div className="group/vc rounded-full h-12 w-12 relative">
                <img
                  src={logo}
                  alt="logo"
                  className="rounded-full h-full w-full group-hover/vc:opacity-60"
                />
                <X
                  onClick={() => onRemoveLogo(index)}
                  className="w-4 h-4 absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 opacity-0 group-hover/vc:opacity-100"
                />
              </div>
            ) : (
              <label className="btn btn-circle btn-secondary ">
                <ImagePlus className="w-6 h-6" />
                <input
                  type="file"
                  name="token-logo"
                  accept="image/*"
                  className="invisible absolute"
                  onChange={(e) => onFileChange(e, index)}
                  ref={ref}
                />
              </label>
            )}
          </div>
          <input
            onChange={(e) => onLinkChange(e.target.value, index)}
            placeholder="Input name"
            className="input flex-auto w-full bg-base-200"
            value={link}
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
