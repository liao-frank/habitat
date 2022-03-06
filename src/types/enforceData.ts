import { ClientOptions, ClientUserEditData } from 'discord.js'

export interface EnforceClientData {
  options?: ClientOptions
  roles?: undefined // TODO: EnforceRoleData[]
  presence?: undefined // TODO: PresenceData
  token: string
  userData?: ClientUserEditData
}
