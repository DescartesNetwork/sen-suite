'use client'
import { useCallback, useState } from 'react'
import copy from 'copy-to-clipboard'

import { Copy } from 'lucide-react'
import { asyncWait } from '@/helpers/utils'

export type ClipboardProps = {
  content: string
  idleText?: string
  className?: string
  iconClassName?: string
}

export default function Clipboard({
  content,
  idleText = 'Copy',
  className = 'btn btn-sm btn-ghost btn-square',
  iconClassName = 'w-4 h-4',
}: ClipboardProps) {
  const [copied, setCopied] = useState(false)

  const onCopy = useCallback(async () => {
    copy(content)
    setCopied(true)
    await asyncWait(1500)
    return setCopied(false)
  }, [content])

  const tolltipClassName = copied ? 'tooltip tooltip-open' : 'tooltip'
  const tolltipText = copied ? 'Copied' : idleText

  return (
    <span className={tolltipClassName} data-tip={tolltipText}>
      <button className={className} onClick={onCopy}>
        <Copy className={iconClassName} />
      </button>
    </span>
  )
}
