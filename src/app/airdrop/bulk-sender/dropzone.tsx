'use client'
import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

import { Download, FileUp, Info, X } from 'lucide-react'

export type DropzoneProps = {
  file?: File
  onChange?: (value: File | undefined) => void
}

export default function Dropzone({
  file = undefined,
  onChange = () => {},
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

  const onClear = useCallback(() => {
    if (inputRef.current) inputRef.current.value = ''
    return onChange(undefined)
  }, [inputRef, onChange])

  return (
    <div className="grid grid-cols-12 gap-2">
      <div
        className="col-span-12 card bg-base-200 p-8 cursor-pointer flex flex-col gap-4 items-center"
        {...getRootProps()}
      >
        <FileUp
          className={
            'w-8 h-8' +
            (isDragActive ? ' animate-bounce' : '') +
            (file ? ' stroke-lime-500' : '')
          }
        />
        <input {...getInputProps()} />
        {!file ? (
          <p className="opacity-60 text-center">
            Drag n Drop some files here, or click to select files
          </p>
        ) : (
          <p>{file.name}</p>
        )}
        {!file ? (
          <p className="opacity-60 text-xs text-center italic -mt-2">
            (Only accept *.csv or *.txt)
          </p>
        ) : (
          <button
            className="btn btn-xs btn-neutral -mt-2"
            onClick={onClear}
            disabled={!file}
          >
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>
      <div className="col-span-12 flex flex-row gap-1 items-center">
        <Download className="w-3 h-3 opacity-60" />
        <p className="text-xs opacity-60">Download templates</p>
        <a className="text-xs underline" href="#">
          csv,
        </a>
        <a className="text-xs underline flex-auto" href="#">
          txt.
        </a>
        <Info className="w-3 h-3 opacity-60 ml-3" />
        <p className="text-xs opacity-60">Skip this step to manually input.</p>
      </div>
    </div>
  )
}
