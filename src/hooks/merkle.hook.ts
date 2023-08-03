import { useCallback, useMemo } from 'react'
import axios from 'axios'
import { encode } from 'bs58'
import { MerkleDistributor, Utility } from '@sentre/utility'

import { useAnchorProvider } from '@/providers/wallet.provider'
import { useDistributors } from '@/providers/merkle.provider'
import { MetadataBackup, toFilename } from '@/helpers/ipfs'
import solConfig from '@/configs/sol.config'

const { rpc, utilityProgram } = solConfig

export enum Distribute {
  Vesting = 'vesting',
  Airdrop = 'airdrop',
}

/**
 * Instantiate SenUtility
 * @returns sen utility instance
 */
export const useSenUtility = () => {
  const provider = useAnchorProvider()
  const utility = useMemo(
    () => new Utility(provider.wallet, rpc, utilityProgram),
    [provider],
  )
  return utility
}

/**
 * Get type's merkle distributor
 * @param merkle MerkleDistributor
 * @returns Vesting or Airdrop type
 */

export const useParseMerkleType = () => {
  const parseMerkleType = useCallback((merkle: MerkleDistributor) => {
    try {
      const types = [Distribute.Airdrop, Distribute.Vesting]
      for (const type of types) {
        const airdropSalt_v1 = MerkleDistributor.salt('0')
        const airdropSalt_v2 = MerkleDistributor.salt(
          `lightning_tunnel/${type}/0`,
        )
        const salt = merkle.receipients[0].salt
        const x1 = Buffer.compare(airdropSalt_v1, salt)
        const x2 = Buffer.compare(airdropSalt_v2, salt)

        if (x1 !== 0 && x2 !== 0) continue
        return type
      }
      return null
    } catch (error) {
      return null
    }
  }, [])

  return parseMerkleType
}

export const useMerkleMetadata = () => {
  const distributors = useDistributors()
  const getMetadata = useCallback(
    async (distributor: string) => {
      const { metadata } = distributors[distributor]
      let cid = encode(Buffer.from(metadata))
      if (MetadataBackup[distributor]) cid = MetadataBackup[distributor]

      const fileName = toFilename(cid)
      const url = 'https://sen-storage.s3.us-west-2.amazonaws.com/' + fileName
      const { data } = await axios.get(url)
      return data
    },
    [distributors],
  )

  return getMetadata
}
