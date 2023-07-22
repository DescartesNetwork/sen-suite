import axios from 'axios'

export const getPrice = async (mintAddress: string) => {
  try {
    const {
      data: {
        data: {
          [mintAddress]: { price },
        },
      },
    } = await axios.get<{
      data: Record<string, { price: number }>
      timeTake: number
    }>(`https://price.jup.ag/v4/price?ids=${mintAddress}`)
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
