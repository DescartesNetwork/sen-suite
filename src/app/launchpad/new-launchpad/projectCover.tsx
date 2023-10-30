'use client'
import { useDropzone } from 'react-dropzone'
import classNames from 'classnames'

import { FileUp, X } from 'lucide-react'

import { useGlobalLaunchpad } from './page'
import { fileToBase64 } from '@/helpers/utils'

type ProjectCoverProps = {
  onNext: () => void
  onBack: () => void
}

export default function ProjectCover({ onNext, onBack }: ProjectCoverProps) {
  const [launchpadData, setLaunchpadData] = useGlobalLaunchpad()
  const coverPhoto = launchpadData.projectInfo.coverPhoto

  const onDrop = async (files: File[]) => {
    if (!files || !files.length) return
    const [file] = files
    fileToBase64(file, onImgChange)
  }

  const onImgChange = (img: string) => {
    const nextProjectInfo = {
      ...launchpadData.projectInfo,
      coverPhoto: img,
    }
    return setLaunchpadData({ ...launchpadData, projectInfo: nextProjectInfo })
  }

  const onRemoveLogo = () => {
    if (inputRef.current) inputRef.current.value = ''
    const nextProjectInfo = {
      ...launchpadData.projectInfo,
      coverPhoto: '',
    }
    return setLaunchpadData({ ...launchpadData, projectInfo: nextProjectInfo })
  }

  const { getRootProps, getInputProps, isDragActive, inputRef } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/jpg': [],
    },
  })

  return (
    <div className="grid grid-cols-12 gap-6">
      <p className="col-span-full text-sm">
        The cover photo on your project will help create more impressions and
        attract users.
      </p>
      {coverPhoto ? (
        <div className="col-span-full group/photo aspect-video relative rounded-xl cursor-pointer">
          <img
            src={coverPhoto}
            alt="logo"
            className="rounded-xl h-full w-full group-hover/photo:opacity-60 object-cover"
          />
          <button
            onClick={onRemoveLogo}
            className="btn btn-ghost absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 opacity-0 group-hover/photo:opacity-100"
          >
            <X />
          </button>
        </div>
      ) : (
        <div className="col-span-full aspect-video">
          <div
            className=" h-full card bg-base-200 p-8 cursor-pointer border-dashed border-2 flex flex-col gap-4 items-center justify-center"
            {...getRootProps()}
          >
            <div className="bg-[#f9575e1a] p-3 rounded-xl">
              <FileUp
                size={24}
                className={classNames('text-primary', {
                  'animate-bounce': isDragActive,
                })}
              />
            </div>
            <input {...getInputProps()} />
            <div className="flex flex-col gap-4 items-center">
              <p className="opacity-60 text-center">
                Click or drag image to upload
              </p>
              <p className="opacity-60 text-xs text-center italic -mt-2">
                Should be 800x450px with JPG, PNG file.
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="col-span-full grid grid-cols-12 gap-3">
        <button className="col-span-6 btn btn-block" onClick={onBack}>
          Back
        </button>
        <button
          onClick={onNext}
          className="col-span-6 btn btn-primary btn-block"
          disabled={!coverPhoto}
        >
          Continue
        </button>
      </div>
    </div>
  )
}
