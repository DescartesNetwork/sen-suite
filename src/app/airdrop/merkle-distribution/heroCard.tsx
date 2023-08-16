import { LucideIcon } from 'lucide-react'

type HeroCardProps = {
  label: string
  value: string
  Icon: LucideIcon
  loading?: boolean
}

const HeroCard = ({ Icon, label, value, loading }: HeroCardProps) => {
  return (
    <div className="card flex flex-row py-4 px-5 md:px-6 rounded-xl bg-base-100 md:items-center">
      <div className="flex-auto flex flex-col gap-2">
        <p className="text-base leading-[45px] md:leading-0 md:text-sm opacity-60">
          {label}
        </p>
        {loading ? (
          <span className="loading loading-bars loading-xs" />
        ) : (
          <h4 className="md:text-xl">{value}</h4>
        )}
      </div>
      <div>
        <div className="bg-[#f9575e1a] p-3 rounded-xl">
          <Icon className="text-primary" />
        </div>
      </div>
    </div>
  )
}

export default HeroCard
