import { FolderSearch } from 'lucide-react'

export default function Empty() {
  return (
    <span className="opacity-60 flex flex-row gap-2 items-center">
      <FolderSearch className="w-6 h-6" />
      <p className="w-full text-center">No Data</p>
    </span>
  )
}
