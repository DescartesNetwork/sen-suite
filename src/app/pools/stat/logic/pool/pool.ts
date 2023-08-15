import Balancer, { PoolData } from '@senswap/balancer'
import { BN } from '@coral-xyz/anchor'

import { undecimalize } from '@/helpers/decimals'
import { LOG_VERSION, TransLog } from '../../entities/trans-log'
import { DateHelper } from '../../helpers/date'
import { TotalSummary } from '../../constants/summary'
import { getPrice } from '@/helpers/stat'
import { TransLogService } from '../translog'
import PDB from '@/helpers/pdb'

export default class PoolService {
  poolAddress: string
  poolData: PoolData | undefined
  balansol: Balancer
  poolTransLogService = new TransLogService()

  constructor(poolAddress: string, balansol: Balancer) {
    this.poolAddress = poolAddress
    this.balansol = balansol
  }

  getPoolData = async (): Promise<PoolData> => {
    if (!this.poolData) {
      this.poolData = await this.balansol.getPoolData(this.poolAddress)
    }
    return this.poolData
  }

  getUsd = async (mint: string, amountBigint: string, decimals: number) => {
    const price = await getPrice(mint)
    const amount = undecimalize(new BN(amountBigint), decimals)
    return Number(amount) * price
  }

  fetchTransLog = async (
    timeFrom: number,
    timeTo: number,
  ): Promise<TransLog[]> => {
    const db = new PDB(this.poolAddress).createInstance('stat')
    let cacheTransLog: TransLog[] = (await db.getItem('translogs')) || []
    cacheTransLog = cacheTransLog.filter(
      (e) =>
        e._v === LOG_VERSION &&
        e.blockTime >= timeFrom &&
        e.blockTime <= timeTo,
    )
    cacheTransLog = cacheTransLog.sort((a, b) => b.blockTime - a.blockTime)

    const newLogs = await this.poolTransLogService.collect(this.poolAddress, {
      secondFrom: cacheTransLog.at(-1)?.blockTime || timeFrom,
      secondTo: timeTo,
    })
    // Filter duplicated
    const mapExist: { [x: string]: boolean } = {}
    const filteredLogs: TransLog[] = []
    for (const log of [...cacheTransLog, ...newLogs]) {
      if (mapExist[log.signature] || log._v !== LOG_VERSION) continue
      filteredLogs.push(log)
      mapExist[log.signature] = true
    }

    await db.setItem('translogs', filteredLogs)
    return filteredLogs
  }

  getDailyInfo = async (timeFrom: DateHelper, timeTo: DateHelper) => {
    const { fee, taxFee, treasuries } = await this.getPoolData()
    const _treasuries = treasuries.map((e) => e.toBase58())
    // fetch transLog
    const transLogs = await this.fetchTransLog(
      timeFrom.seconds(),
      timeTo.seconds(),
    )

    // Build result
    const mapTimeTotal: Record<string, TotalSummary> = {}
    function getMapTimeTotal(ymd: number) {
      if (!mapTimeTotal[ymd]) {
        mapTimeTotal[ymd] = {
          tvl: 0,
          fee: 0,
          volume: 0,
        }
      }
      return mapTimeTotal[ymd]
    }

    for (const log of transLogs) {
      for (const transfer of log.actionTransfers) {
        const { source, destination, amount, mint, decimals } = transfer
        let treasury = ''
        if (_treasuries.includes(source)) treasury = source
        if (_treasuries.includes(destination)) treasury = destination
        if (!treasury) continue
        const ymd = DateHelper.fromSeconds(log.blockTime).ymd()
        const report = getMapTimeTotal(ymd)

        const volume = await this.getUsd(mint, amount, decimals)
        const totalFee = Number(undecimalize(fee.add(taxFee), 9)) * volume

        report.volume += volume
        report.fee += totalFee
      }
    }

    while (timeTo.ymd() > timeFrom.ymd()) {
      getMapTimeTotal(timeTo.ymd())
      timeTo = timeTo.subtractDay(1)
    }
    return mapTimeTotal
  }
}
