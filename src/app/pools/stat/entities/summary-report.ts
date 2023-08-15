import { DailyReport } from './daily-report'

export class SummaryReport {
  programId: string = ''
  time: number = 0
  address: string = ''
  mint: string = ''
  opening: bigint = BigInt(0)
  amountIn: bigint = BigInt(0)
  amountOut: bigint = BigInt(0)
  closing: bigint = BigInt(0)

  constructor() {
    this.amountIn = BigInt(0)
    this.amountOut = BigInt(0)
    this.opening = BigInt(0)
    this.closing = BigInt(0)
  }

  key = (timeAddress?: number, accountAddr?: string, mintAddress?: string) => {
    if (!timeAddress) timeAddress = this.time
    if (!accountAddr) accountAddr = this.address
    if (!mintAddress) mintAddress = this.mint
    return `${timeAddress}^${accountAddr}^${mintAddress}`
  }

  static fromDailyReport = (dailyReport: DailyReport): SummaryReport => {
    const { programId, address, mint, time, amountIn, amountOut } = dailyReport
    const summary = new SummaryReport()
    summary.programId = programId
    summary.mint = mint
    summary.time = time
    summary.address = address
    summary.amountIn = amountIn
    summary.amountOut = amountOut
    return summary
  }
}
