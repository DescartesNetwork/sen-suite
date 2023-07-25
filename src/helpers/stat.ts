import axios from 'axios'

export const getPrice = async (mintAddress: string) => {
  try {
    const { data: price } = await axios.get<number>(
      `https://sage.sentre.io/price/${mintAddress}`,
    )
    return price
  } catch (er) {
    return 0
  }
}

export const getAllTokens = async () => {
  try {
    const { data } = await axios.get<MintMetadata[]>('https://token.jup.ag/all')
    return data
  } catch (er) {
    return []
  }
}
