'use client'

import Empty from '@/components/empty'
import { shortenAddress } from '@/helpers/utils'
import { useFilterCheques } from '@/providers/launchpad.provider'

type HistoryProps = {
  launchpadAddress: string
}
export default function History({ launchpadAddress }: HistoryProps) {
  const cheques = useFilterCheques(launchpadAddress)

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-full flex gap-2 items-center">
        <h5>Recent transactions</h5>
        <span className="badge rounded-lg">{cheques.length}</span>
      </div>
      <div className="col-span-full overflow-x-auto">
        <table className="table table-zebra">
          <thead className="bg-base-100 ">
            <tr className="rounded-lg">
              <th className="rounded-tl-lg rounded-bl-lg">TIME</th>
              <th>ACCOUNT</th>
              <th>PAY</th>
              <th className="rounded-tr-lg rounded-br-lg">RECEIVE</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>16 Nov, 2022 16:00</th>
              <th>{shortenAddress('asdasdasdasd')}</th>
              <td>1 USCD</td>
              <td>10 ZETA</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="col-span-full">{!cheques.length && <Empty />}</div>
    </div>
  )
}
