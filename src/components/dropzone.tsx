'use client'
import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import classNames from 'classnames'

import { Download, FileUp, Info, X } from 'lucide-react'

export type DropzoneProps = {
  file?: File
  onChange?: (value: File | undefined) => void
  templateFile?: string
}

export default function Dropzone({
  file = undefined,
  onChange = () => {},
  templateFile = '',
}: DropzoneProps) {
  const onDrop = useCallback(
    (files: File[]) => {
      if (!files || !files.length) return onChange(undefined)
      const [file] = files
      return onChange(file)
    },
    [onChange],
  )
  const { getRootProps, getInputProps, isDragActive, inputRef } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
    },
    disabled: !!file,
  })

  const downloadFile = (templateFile: string) => {
    if (!templateFile) return

    const event = document.createElement('a')
    event.href = templateFile
    document.body.appendChild(event)
    event.click()
  }

  const onClear = useCallback(() => {
    if (inputRef.current) inputRef.current.value = ''
    return onChange(undefined)
  }, [inputRef, onChange])

  return (
    <div className="flex flex-col gap-3">
      <div
        className=" h-full card bg-base-200 p-8 cursor-pointer border-dashed border-2 flex flex-col gap-4 items-center"
        {...getRootProps()}
      >
        <div className="bg-[#f9575e1a] p-3 rounded-xl">
          <FileUp
            size={24}
            className={classNames('text-primary', {
              'animate-bounce': isDragActive,
              'stroke-lime-500': !!file,
            })}
          />
        </div>
        <input {...getInputProps()} />
        {!file ? (
          <div className="flex flex-col gap-4 items-center">
            <p className="opacity-60 text-center">
              Click or drag file to this area to upload
            </p>
            <p className="opacity-60 text-xs text-center italic -mt-2">
              (Support CSV, XLSX)
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 items-center">
            <p>{file.name}</p>
            <button
              className="btn btn-xs btn-neutral -mt-2"
              onClick={onClear}
              disabled={!file}
            >
              <X className="w-3 h-3" /> Clear
            </button>
          </div>
        )}
      </div>
      <div className=" flex flex-col gap-6">
        <button
          onClick={() => downloadFile(templateFile)}
          disabled={!templateFile}
          className="flex flex-row gap-2 items-center mx-2 cursor-pointer"
        >
          <Download className="w-3 h-3 font-semibold" />
          <p className="text-sm font-semibold">Download templates</p>
        </button>
        <div className="flex flex-row items-center gap-2">
          <Info className="w-3 h-3" />
          <p className="text-sm">Skip this step to manually input.</p>
        </div>
      </div>
    </div>
  )
}
