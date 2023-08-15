import Modal from '@/components/modal'
import { Fragment, useState } from 'react'

const Deposit = () => {
  const [open, setOpen] = useState(false)
  return (
    <Fragment>
      <button onClick={() => setOpen(true)} className="btn btn-primary btn-sm">
        Deposit
      </button>
      <Modal open={open} onCancel={() => setOpen(false)}>
        Deposit
      </Modal>
    </Fragment>
  )
}

export default Deposit
