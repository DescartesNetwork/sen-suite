import Link from 'next/link'

export default function Airdrop() {
  return (
    <div className="flex w-full h-full justify-center items-center">
      <div className="max-w-[768px] w-full grid grid-cols-12 gap-4 @container">
        <Link
          className="col-span-full @xl:col-span-6 card p-8 bg-panel-light bg-center bg-cover rounded-box shadow-xl hover:shadow-2xl cursor-pointer transition-all text-slate-800 ring-1 ring-slate-200"
          href="/airdrop/bulk-sender"
        >
          <div className="grid grid-cols-12 gap-2">
            <h4 className="col-span-full">Bulk Sender</h4>
            <p className="col-span-full">
              Lorem ipsum dolor sit amet, vim quodsi suscipiantur in. Ne
              vivendum appellantur, veri recteque usu ne. Ad quo tation
              ponderum, eu probo utamur aliquid has. Pro probo percipit eu.
            </p>
          </div>
        </Link>
        <Link
          className="col-span-full @xl:col-span-6 card p-8 bg-panel-dark bg-center bg-cover rounded-box shadow-xl hover:shadow-2xl cursor-pointer transition-all text-slate-200 ring-1 ring-slate-800"
          href="/airdrop/merkle-distribution"
        >
          <div className="grid grid-cols-12 gap-2">
            <h4 className="col-span-full">Merkle Distribution</h4>
            <p className="col-span-full">
              Eam possim debitis id. Solet dicant nam ei, alii autem perpetua ut
              nam, ullum imperdiet an sit. Oblique alienum deleniti mei ad, case
              necessitatibus ad usu.
            </p>
          </div>
        </Link>
      </div>
    </div>
  )
}
