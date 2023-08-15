import { DailyReport } from '../entities/daily-report'
import { SummaryReport } from '../entities/summary-report'
import { DateHelper } from '../helpers/date'

export type SummaryAccount = {
  mint: string
  balance: bigint
}
export default class SummaryReportService {
  accounts: Map<string /*address*/, SummaryAccount>
  constructor(accounts: Map<string, SummaryAccount>) {
    this.accounts = accounts
  }
  /**
   * Because summary value is domino. Current day value dependent  before value.
   * So: required to collect from @dateFrom to now
   */
  parseSummaryReports = async (
    dailyReports: DailyReport[],
    dateRange: number,
  ): Promise<SummaryReport[]> => {
    let summaryReport = this.calculateSummary(dailyReports)
    summaryReport = this.mergeSummaryReport(summaryReport, dateRange)
    return summaryReport
  }

  calculateSummary = (dailyReports: DailyReport[]): SummaryReport[] => {
    const summaryReports: SummaryReport[] = []
    for (const dailyReport of dailyReports) {
      const report = SummaryReport.fromDailyReport(dailyReport)
      summaryReports.push(report)
    }
    return summaryReports
  }

  mergeSummaryReport = (
    summaryReport: Array<SummaryReport>,
    dateRange: number,
  ): Array<SummaryReport> => {
    let currentDate = new DateHelper()
    const ymdFrom = new DateHelper().subtractDay(dateRange).ymd()

    const mapSummary = new Map<string, SummaryReport>()
    for (const report of summaryReport) {
      // filter with accounts
      if (!this.accounts.has(report.address)) continue

      const key = report.key()
      if (mapSummary.has(key)) {
        const val = mapSummary.get(key)
        if (val !== undefined) {
          report.amountIn += val.amountIn
          report.amountOut += val.amountOut
        }
      }
      mapSummary.set(key, report)
    }
    //Calculate opening + closing
    while (currentDate.ymd() >= ymdFrom) {
      const ymd = currentDate.ymd()
      this.accounts.forEach((account, accountAddr) => {
        this.generateSummary(
          mapSummary,
          ymd,
          accountAddr,
          account.mint,
          account.balance,
        )
      })
      currentDate = currentDate.subtractDay()
    }
    const results: SummaryReport[] = []
    mapSummary.forEach((report) => results.push(report))
    return results
  }

  generateSummary(
    mapSummary: Map<string, SummaryReport>,
    dateYmd: number,
    accountAddr: string,
    mintAddr: string,
    balance: bigint,
  ): Map<string, SummaryReport> {
    const currentDate = DateHelper.fromYmd(dateYmd)

    const newSummary = new SummaryReport()
    newSummary.address = accountAddr
    newSummary.mint = mintAddr
    newSummary.time = currentDate.ymd()

    const currentKey = newSummary.key()
    const nextDateKey = newSummary.key(currentDate.addDay().ymd())
    if (!mapSummary.has(currentKey)) {
      mapSummary.set(currentKey, newSummary)
    }
    const currentSummary = mapSummary.get(currentKey)
    if (!currentSummary) return mapSummary

    currentSummary.closing = mapSummary.has(nextDateKey)
      ? mapSummary.get(nextDateKey)?.opening || BigInt(0)
      : balance
    currentSummary.opening =
      currentSummary.closing -
      currentSummary.amountIn +
      currentSummary.amountOut

    return mapSummary
  }
}
