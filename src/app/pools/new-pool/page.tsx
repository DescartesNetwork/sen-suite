'use client'
import SetupToken from './setupToken'

const NewPool = () => {
  return (
    <div className="w-full max-w-[660px] card bg-base-100 grid grid-cols-12 gap-2">
      <div className="col-span-full">
        <h5>New Pool</h5>
      </div>
      <div className="col-span-full">
        <SetupToken />
      </div>
    </div>
  )
}

export default NewPool
