'use client'
import { useMemo, useState } from 'react'
import { Keypair } from '@solana/web3.js'

import TokenKeypair from './tokenKeypair'

export default function NewToken() {
  const [keypair, setKeypair] = useState<Keypair>(new Keypair())
  const [decimals, setDecimals] = useState(9)
  const [symbol, setSymbol] = useState('')
  const [name, setName] = useState('')

  const disabled = useMemo(() => {
    if (!keypair) return true
    if (decimals < 0 || decimals > 18) return true
    if (!symbol) return true
    if (!name) return true
    return false
  }, [keypair, decimals, symbol, name])

  return (
    <div className="card rounded-3xl bg-base-100 shadow-xl p-4 grid grid-cols-12 gap-2">
      <div className="col-span-12">
        <TokenKeypair keypair={keypair} onChange={setKeypair} />
      </div>
      <div className="col-span-12">
        <p className="text-sm font-bold">Token Name</p>
      </div>
      <div className="col-span-12">
        <input
          className="input w-full bg-base-200"
          type="text"
          name="name"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="col-span-6">
        <p className="text-sm font-bold">Token Decimals</p>
      </div>
      <div className="col-span-6">
        <p className="text-sm font-bold">Token Symbol</p>
      </div>
      <div className="col-span-6">
        <input
          className="input w-full bg-base-200"
          type="number"
          step={1}
          min={0}
          max={18}
          name="decimals"
          placeholder="Decimals"
          value={decimals}
          onChange={(e) => setDecimals(Number(e.target.value))}
        />
      </div>
      <div className="col-span-6">
        <input
          className="input w-full bg-base-200"
          type="text"
          name="symbol"
          placeholder="Symbol"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
        />
      </div>
      <div className="col-span-12">
        <button className="btn btn-primary w-full" disabled={disabled}>
          Create
        </button>
      </div>
    </div>
  )
}
