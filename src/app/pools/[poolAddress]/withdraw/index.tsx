import Modal from '@/components/modal'
import { Fragment, useState } from 'react'

const Withdraw = () => {
  const [open, setOpen] = useState(false)
  return (
    <Fragment>
      <button onClick={() => setOpen(true)} className="btn btn-sm">
        Withdraw
      </button>
      <Modal open={open} onCancel={() => setOpen(false)}>
        Withdraw
      </Modal>
    </Fragment>
  )
}

export default Withdraw
