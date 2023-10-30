'use client'
import { useCallback } from 'react'

export const acceptable_categories = {
  defi: [49, 100, 0],
  gamefi: [4, 100, 253],
  DAO: [114, 100, 7],
  multisig: [248, 100, 176],
  lending: [147, 100, 156],
  portfolio: [72, 100, 5],
  liquidity: [242, 100, 21],
  AMM: [161, 100, 253],
  privacy: [136, 100, 35],
  payment: [108, 100, 145],
  utility: [156, 100, 45],
  NFT: [4, 100, 253],
}

type CategoryTagProps = {
  category: keyof typeof acceptable_categories
}

export default function CategoryTag({ category }: CategoryTagProps) {
  const categoryColor = useCallback(
    (opacity?: string) => {
      const color = acceptable_categories[category]
      if (opacity) return `rgba(${color[0]},${color[1]},${color[2]},${opacity})`
      return `rgba(${color[0]},${color[1]},${color[2]},1)`
    },
    [category],
  )
  return (
    <div
      className="badge rounded-lg"
      style={{ color: categoryColor(), background: categoryColor('0.1') }}
    >
      {category}
    </div>
  )
}
