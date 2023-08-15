import { numeric } from '@/helpers/utils'

const Volume24h = () => {
  return (
    <div className="card rounded-3xl p-6 bg-[#F2F4FA] dark:bg-[#212C4C] flex flex-col gap-6">
      <div className="flex items-center">
        <p className="flex-auto">Volume 24h</p>
        <h5>{numeric(0).format('0,0.[0]a$')}</h5>
      </div>
      <div className="flex items-center justify-center h-[278px]">
        <span>Coming soon</span>
      </div>
    </div>
  )
}

export default Volume24h
