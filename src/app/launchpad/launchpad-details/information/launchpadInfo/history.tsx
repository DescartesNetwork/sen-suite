'use client'
import { useState } from 'react'
import dayjs from 'dayjs'
import classNames from 'classnames'

import Empty from '@/components/empty'
import { MintAmount, MintSymbol } from '@/components/mint'

import { shortenAddress } from '@/helpers/utils'
import {
  useChequeByAddress,
  useFilterCheques,
  useLaunchpadByAddress,
} from '@/providers/launchpad.provider'

type HistoryProps = {
  launchpadAddress: string
}
export default function History({ launchpadAddress }: HistoryProps) {
  const [pageSize, setPageSize] = useState(4)
  const cheques = useFilterCheques(launchpadAddress)

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-full flex gap-2 items-center">
        <h5>Recent transactions</h5>
        <span className="badge rounded-lg">{cheques.length}</span>
      </div>
      <div className="col-span-full overflow-x-auto">
        <table className="table">
          <thead className="bg-base-100 ">
            <tr className="rounded-lg">
              <th className="rounded-tl-lg rounded-bl-lg">TIME</th>
              <th>ACCOUNT</th>
              <th>PAY</th>
              <th className="rounded-tr-lg rounded-br-lg">RECEIVE</th>
            </tr>
          </thead>
          <tbody>
            {cheques.slice(0, pageSize).map((chequeAddress, index) => (
              <HistoryItem
                key={chequeAddress}
                chequeAddress={chequeAddress}
                index={index}
              />
            ))}
          </tbody>
        </table>
      </div>
      {!cheques.length && (
        <div className="col-span-full">
          <Empty />
        </div>
      )}
      <div className="col-span-full text-center">
        <button
          onClick={() => setPageSize(pageSize + 4)}
          className="btn btn-ghost"
          disabled={!cheques.length || pageSize >= cheques.length}
        >
          View more
        </button>
      </div>
    </div>
  )
}

const HistoryItem = ({
  chequeAddress,
  index,
}: {
  chequeAddress: string
  index: number
}) => {
  const { createAt, authority, askAmount, bidAmount, launchpad } =
    useChequeByAddress(chequeAddress)
  const { mint, stableMint } = useLaunchpadByAddress(launchpad.toBase58())
  return (
    <tr
      className={classNames('rounded-lg', {
        'bg-base-100': index % 2 !== 0,
      })}
    >
      <td className="rounded-tl-lg rounded-bl-lg">
        {dayjs(createAt.toNumber() * 1000).format('MMM DD, YYYY HH:mm')}
      </td>
      <td>{shortenAddress(authority.toBase58())}</td>
      <td>
        <MintAmount amount={bidAmount} mintAddress={stableMint.toBase58()} />{' '}
        <MintSymbol mintAddress={stableMint.toBase58()} />
      </td>
      <td className="rounded-tr-lg rounded-br-lg">
        <MintAmount amount={askAmount} mintAddress={mint.toBase58()} />{' '}
        <MintSymbol mintAddress={mint.toBase58()} />
      </td>
    </tr>
  )
}
