import LazyLoad from 'react-lazy-load'
import NftCard from './nftCard'
import Empty from '../empty'

type NftListProps = {
  nftAddresses?: string[]
  nftSelected?: string
  onChange?: (mintAddress: string) => void
}

const NftList = ({
  nftAddresses = [],
  nftSelected = '',
  onChange = () => {},
}: NftListProps) => {
  return (
    <div className="grid grid-cols-12 gap-4 max-h-96 overflow-y-auto overflow-x-hidden no-scrollbar">
      {nftAddresses.map((nftAddress) => (
        <div className="col-span-4" key={nftAddress}>
          <LazyLoad>
            <NftCard
              active={nftAddress === nftSelected}
              nftAddress={nftAddress}
              onChange={onChange}
            />
          </LazyLoad>
        </div>
      ))}
      {!nftAddresses.length && (
        <div className="col-span-full">
          <Empty />
        </div>
      )}
    </div>
  )
}

export default NftList
