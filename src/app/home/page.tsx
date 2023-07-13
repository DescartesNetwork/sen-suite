'use client'

export default function Home() {
  return (
    <div className="grid grid-cols-12 gap-2">
      <h3 className="col-span-12">Home</h3>
      <div className="col-span-6">
        <button className="btn btn-primary w-full">Home</button>
      </div>
      <div className="col-span-6">
        <button className="btn btn-secondary w-full">Home</button>
      </div>
    </div>
  )
}
