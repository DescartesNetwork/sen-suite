'use client'
import { useMyReceivedList } from '@/providers/merkle.provider'

export default function MerkleDistribution() {
  const { receivedList } = useMyReceivedList()
  console.log('distributors: ', receivedList)
  return <div className="flex">Dashboard</div>
}
