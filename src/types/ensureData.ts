import { StrictlyExtends } from '@myTypes/utility'
import { ClientOptions, ClientUserEditData } from 'discord.js'

interface BaseEnsureData {
  id?: string
  name: string
}

export interface EnsureClientData
  extends StrictlyExtends<BaseEnsureData, EnsureClientData> {
  id: undefined
  options?: ClientOptions
  roles?: never
  token: string
  userData?: ClientUserEditData
}
