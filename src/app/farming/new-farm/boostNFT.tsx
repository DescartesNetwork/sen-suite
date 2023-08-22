const BoostNFT = () => {
  return (
    <div className="grid grid-cols-12 gap-2">
      <div className="col-span-full flex items-center justify-between">
        <p className="font-bold">Boost by NFT</p>
        <input type="checkbox" className="toggle toggle-sm" />
      </div>
      <p className="col-span-full text-sm">
        Enable <span className="text-primary">Boost</span> means that you will
        allow users to use NFTs to increase their contribution. You need to set
        the corresponding plus boost rate for each NFT collection.
      </p>
    </div>
  )
}

export default BoostNFT
