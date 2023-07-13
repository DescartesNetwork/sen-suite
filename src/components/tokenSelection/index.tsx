import Modal from '@/components/modal'
import { Search } from 'lucide-react'

export type TokenSelectionType = {
  open?: boolean
  onCancel?: () => void
}

export default function TokenSelection({ open, onCancel }: TokenSelectionType) {
  return (
    <Modal open={open} onCancel={onCancel}>
      <div className="grid grid-cols-12 gap-2">
        <div className="col-span-12 relative">
          <Search className="pointer-events-none w-4 h-4 absolute top-1/2 transform -translate-y-1/2 left-3" />
          <input
            type="search"
            name="search"
            placeholder="Search"
            className="input input-sm w-full pl-10"
          />
        </div>
      </div>
    </Modal>
  )
}
