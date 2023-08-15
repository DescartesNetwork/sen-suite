export const LOG_VERSION = '0.0.1'

export type ActionTransfer = {
  amount: string
  source: string
  destination: string
  authority: string
  mint: string
  decimals: number
}

export type ParsedSplTransfer = {
  info: ActionTransfer
  type: 'transfer'
}
export class TransLog {
  _v = LOG_VERSION
  programId: string = ''
  programInfo: ProgramInfo | undefined
  signature: string = ''
  recentBlockhash: string = ''
  blockTime: number = 0
  time: number = 0
  owner: string = ''
  actionType: string = ''
  actionTransfers: Array<ActionTransfer> = []
}

export class ActionInfo {
  address: string = ''
  mint: string = ''
  decimals: number = 0
  preBalance: string = '0'
  postBalance: string = '0'
}

type ProgramInfo = {
  programId: string
  data: string
}
