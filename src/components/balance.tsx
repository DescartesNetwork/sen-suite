'use client'
import { Fragment } from 'react'
import { utils } from '@coral-xyz/anchor'
import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { BN } from 'bn.js'

import { useMintByAddress } from '@/providers/mint.provider'
import { undecimalize } from '@/helpers/decimals'
import { numeric } from '@/helpers/utils'
import { useTokenAccountsSelector } from '@/providers/wallet.provider'

/**
 * Get readable (undecimalized) token balance
 * @param mintAddress Mint Address
 * @returns Balance
 */
export const useMyReadableBalanceByMintAddress = (mintAddress: string) => {
  const { publicKey } = useWallet()
  const { decimals } = useMintByAddress(mintAddress) || { decimals: 0 }
  const balance = useTokenAccountsSelector<string>((tokenAccounts) => {
    if (!publicKey || !mintAddress) return '0'
    const tokenAccount = utils.token.associatedAddress({
      mint: new PublicKey(mintAddress),
      owner: publicKey,
    })
    const { amount } = tokenAccounts[tokenAccount.toBase58()] || {
      amount: new BN(0),
    }
    return undecimalize(amount, decimals)
  })
  return balance
}

export type MyBalanceProps = {
  mintAddress: string
  format?: string
}

export default function MyBalance({
  mintAddress,
  format = '$0,0.[00]',
}: MyBalanceProps) {
  const balance = useMyReadableBalanceByMintAddress(mintAddress)
  return <Fragment>{numeric(balance).format(format)}</Fragment>
}
