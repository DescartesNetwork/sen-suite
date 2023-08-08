import { Fragment, useState } from 'react'
import { PublicKey } from '@solana/web3.js'
import { BN } from 'bn.js'

import { ChevronDown } from 'lucide-react'
import RewardCard, { ReceiptState } from './rewardCard'

import { ReceiveItem } from './page'

const DEFAULT_AMOUNT = 4

const data: ReceiveItem[][] = [
  [
    {
      status: ReceiptState.waiting,
      distributor: '23423423',
      mintAddress: 'SENBBKVCM7homnf5RX9zqpf1GFe935hnbU4uVzY1Y6M',
      endedAt: 0,
      sender: 'Cs6jYywHTAgdvjxn8xG4VkJJH8DXXy7zbtatzMUWoCMG',
      leaf: {
        authority: new PublicKey(
          '2vAEiACep3J1N2J6YY9gt4gAbbFEvuVdWgyu8KUkgzgn',
        ),
        amount: new BN(1000),
        startedAt: new BN(0),
        salt: Buffer.from([
          62, 247, 109, 224, 87, 51, 167, 19, 127, 100, 70, 119, 55, 58, 238,
          120, 156, 76, 116, 38, 65, 217, 158, 68, 14, 134, 0, 66, 0, 73, 80,
          13,
        ]),
      },
    },
    {
      status: ReceiptState.expired,
      distributor: '342',
      mintAddress: 'SENBBKVCM7homnf5RX9zqpf1GFe935hnbU4uVzY1Y6M',
      endedAt: 0,
      sender: 'Cs6jYywHTAgdvjxn8xG4VkJJH8DXXy7zbtatzMUWoCMG',
      leaf: {
        authority: new PublicKey(
          '2vAEiACep3J1N2J6YY9gt4gAbbFEvuVdWgyu8KUkgzgn',
        ),
        amount: new BN(1000),
        startedAt: new BN(0),
        salt: Buffer.from([
          62, 247, 109, 224, 87, 51, 167, 19, 127, 100, 70, 119, 55, 58, 238,
          120, 156, 76, 116, 38, 65, 217, 158, 68, 14, 134, 0, 66, 0, 73, 80,
          13,
        ]),
      },
    },
  ],
  [
    {
      status: ReceiptState.claimed,
      distributor: '5gHxpdyoirFphGW8kprP63AqiAxYTB2PdUqUQUosUeUJ',
      mintAddress: 'SENBBKVCM7homnf5RX9zqpf1GFe935hnbU4uVzY1Y6M',
      endedAt: 0,
      sender: 'Cs6jYywHTAgdvjxn8xG4VkJJH8DXXy7zbtatzMUWoCMG',
      leaf: {
        authority: new PublicKey(
          '2vAEiACep3J1N2J6YY9gt4gAbbFEvuVdWgyu8KUkgzgn',
        ),
        amount: new BN(1000),
        startedAt: new BN(0),
        salt: Buffer.from([
          62, 247, 109, 224, 87, 51, 167, 19, 127, 100, 70, 119, 55, 58, 238,
          120, 156, 76, 116, 38, 65, 217, 158, 68, 14, 134, 0, 66, 0, 73, 80,
          13,
        ]),
      },
    },
    {
      status: ReceiptState.claimed,
      distributor: '23423555',
      mintAddress: 'SENBBKVCM7homnf5RX9zqpf1GFe935hnbU4uVzY1Y6M',
      endedAt: 0,
      sender: 'Cs6jYywHTAgdvjxn8xG4VkJJH8DXXy7zbtatzMUWoCMG',
      leaf: {
        authority: new PublicKey(
          '2vAEiACep3J1N2J6YY9gt4gAbbFEvuVdWgyu8KUkgzgn',
        ),
        amount: new BN(1000),
        startedAt: new BN(0),
        salt: Buffer.from([
          62, 247, 109, 224, 87, 51, 167, 19, 127, 100, 70, 119, 55, 58, 238,
          120, 156, 76, 116, 38, 65, 217, 158, 68, 14, 134, 0, 66, 0, 73, 80,
          13,
        ]),
      },
    },
  ],
]

const VestingList = ({ vesting }: { vesting: ReceiveItem[][] }) => {
  const [showAirdrop, setAmountAirdrop] = useState(DEFAULT_AMOUNT)

  return (
    <div className="card bg-base-100 p-4 gap-6">
      <div className="flex">
        <p>
          Vesting receive
          <span className="ml-2">{vesting.length}</span>
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>UNLOCK TIME</th>
              <th>EXPIRATION TIME</th>
              <th>SENDER</th>
              <th>TOKEN</th>
              <th>AMOUNT</th>
              <th>STATUS</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, showAirdrop).map((campaign, i) => (
              <Fragment key={i}>
                {campaign.map((props: ReceiveItem) => (
                  <RewardCard key={`${props.distributor}${i}`} {...props} />
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <button
        onClick={() => setAmountAirdrop(showAirdrop + DEFAULT_AMOUNT)}
        disabled={showAirdrop >= vesting.length}
        className="btn btn-ghost flex self-center"
      >
        <ChevronDown className="h-4 w-4" /> View more
      </button>
    </div>
  )
}

export default VestingList
