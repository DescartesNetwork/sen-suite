import { useMemo } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

import Modal from '../modal'
import Island from '../island'
import NftList from './nftList'

import { useNftsByOwner } from '@/hooks/mpl.hook'

type NFTSelectionProps = {
  open?: boolean
  mintAddress?: string
  onCancel?: () => void
  onChange?: (mintAddress: string) => void
  onlyCollection?: boolean
}
const NFTSelection = ({
  open,
  mintAddress,
  onlyCollection,
  onCancel,
  onChange = () => {},
}: NFTSelectionProps) => {
  const { publicKey } = useWallet()
  const nfts = useNftsByOwner(publicKey?.toBase58() || '')

  const nftsOrCollections = useMemo(() => {
    if (!onlyCollection)
      return nfts.map((nft: any) => nft.mintAddress.toBase58())
    const collections = nfts
      .map(({ collection }) => collection?.address.toBase58())
      .filter(
        (collection, i, collections) =>
          collection && collections.findIndex((e) => e === collection) === i,
      )
    return collections
  }, [nfts, onlyCollection])

  return (
    <Modal open={open} onCancel={onCancel}>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12">
          <h5>Select your {onlyCollection ? 'collection' : 'nft'}</h5>
        </div>
        <div className="col-span-12">
          <Island>
            <NftList
              nftAddresses={nftsOrCollections}
              nftSelected={mintAddress}
              onChange={onChange}
            />
          </Island>
        </div>
      </div>
    </Modal>
  )
}

export default NFTSelection
