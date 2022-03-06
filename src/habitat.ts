import { ensureClient } from '@lib/ensureClient'
import { EnsureClientData } from '@myTypes/ensureData'

export class Habitat {
  constructor(config: HabitatConfig) {
    this.ensureClients(config.clients)
  }

  ensureClients(datas: EnsureClientData[]) {
    for (const data of datas) {
      ensureClient(data)
    }
  }
}

export interface HabitatConfig {
  clients: EnsureClientData[]
}
