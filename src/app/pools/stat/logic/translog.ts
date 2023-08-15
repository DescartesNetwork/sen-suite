import { utils, web3 } from '@coral-xyz/anchor'

import { ParsedSplTransfer, TransLog } from '../entities/trans-log'
import { Solana } from '../adapters/solana/client'
import { OptionsFetchSignature } from '../constants/transaction'
import { DateHelper } from '../helpers/date'

export class TransLogService {
  async collect(
    programId: string,
    configs: OptionsFetchSignature,
    filterTransLog?: (transLog: TransLog) => Promise<boolean>,
  ): Promise<TransLog[]> {
    const { lastSignature, limit } = configs
    const solana = new Solana()
    const transLogs: Array<TransLog> = []
    let lastSignatureTmp = lastSignature
    let isStop = false
    let smartLimit = 200
    while (!isStop) {
      const confirmedTrans = await solana.fetchTransactions(programId, {
        ...configs,
        lastSignature: lastSignatureTmp,
        limit: smartLimit,
      })
      for (const trans of confirmedTrans) {
        if (!trans) continue
        lastSignatureTmp = trans.transaction.signatures[0]
        const log = this.parseTransLog(trans)
        if (!log) continue
        // filter
        if (filterTransLog) {
          const checked = await filterTransLog(log)
          if (!checked) continue
        }
        transLogs.push(log)

        if (limit && transLogs.length >= limit) {
          isStop = true
          break
        }
      }
      if (limit) smartLimit = (smartLimit * limit) / (transLogs.length || 1)
      if (!confirmedTrans.length) break
      if (isStop) break
    }
    return transLogs
  }

  private parseTransLog(
    confirmedTrans: web3.ParsedTransactionWithMeta,
  ): TransLog | undefined {
    const { blockTime, meta, transaction } = confirmedTrans
    if (!blockTime || !meta) return

    const { signatures, message } = transaction

    const transLog = new TransLog()
    transLog.signature = signatures[0]
    transLog.blockTime = blockTime
    transLog.time = DateHelper.fromSeconds(blockTime).ymd()
    transLog.recentBlockhash = message.recentBlockhash

    for (const innerInstruction of meta.innerInstructions || []) {
      const innerInstructionData =
        innerInstruction.instructions as web3.ParsedInstruction[]
      for (const ix of innerInstructionData) {
        const parsed: ParsedSplTransfer = ix?.parsed
        if (parsed?.type !== 'transfer') continue

        meta.postTokenBalances?.forEach((e) => {
          if (!e.owner) return
          const tokenAccount = utils.token.associatedAddress({
            mint: new web3.PublicKey(e.mint),
            owner: new web3.PublicKey(e.owner),
          })
          const { source, destination } = parsed.info
          if ([source, destination].includes(tokenAccount.toBase58())) {
            parsed.info.decimals = e.uiTokenAmount.decimals
            parsed.info.mint = e.mint
          }
        })
        transLog.actionTransfers.push(parsed.info)
      }
    }
    return transLog
  }
}
