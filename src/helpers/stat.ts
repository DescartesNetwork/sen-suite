import axios from 'axios'

import sageConfig from '@/configs/sage.config'

export const getPrice = async (mintAddress: string) => {
  try {
    const { data: price } = await axios.get<number>(
      `${sageConfig.host}/price/${mintAddress}`,
    )
    return price
  } catch (er) {
    return 0
  }
}

export const getAllTokens = async () => {
  try {
    const { data } = await axios.get<MintMetadata[]>(
      'https://token.jup.ag/strict',
    )
    return data
  } catch (er) {
    return []
  }
}
