import { enforceClient } from './client'
import { EnforceClientData } from '@myTypes/enforceData'

export class Habitat {
  constructor(config: HabitatConfig) {
    this.enforceClients(config.clients)
  }

  enforceClients(datas: EnforceClientData[]) {
    for (const data of datas) {
      enforceClient(data)
    }
  }
}

export interface HabitatConfig {
  clients: EnforceClientData[]
  roles: undefined // TODO: EnforceRoleData[]
}
