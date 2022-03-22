import { EnforceClientData } from '@myTypes/enforceData'
import { Client, ClientUser, Guild } from 'discord.js'

import { enforceClient, getClientUser } from './client'

export class Habitat {
  readonly config: HabitatConfig
  private readonly clientsPromise: Promise<Client[]>

  constructor(config: HabitatConfig) {
    this.config = Object.freeze(config)

    this.clientsPromise = this.enforceAllClients()
  }

  // Runs relevant enforcements on a guild, including channel enforcements and
  // role enforcements.
  async enforceGuild(guild: Guild): Promise<void> {
    // TODO
  }

  async getClients(excludeAdmin?: boolean): Promise<Client[]> {
    let clients = await this.clientsPromise

    if (excludeAdmin) {
      const adminToken = this.config.admin.token
      clients = clients.filter((client) => client.token !== adminToken)
    }

    return clients
  }

  async getClientUsers(excludeAdmin?: boolean): Promise<ClientUser[]> {
    const clients = await this.getClients(excludeAdmin)

    return Promise.all(clients.map((client) => getClientUser(client)))
  }

  private async enforceAllClients(): Promise<Client[]> {
    const clients = this.config.clients || []

    const adminEnforcement = enforceClient(this.config.admin, this)
    const nonAdminEnforcements = clients.map((client) =>
      enforceClient(client, this)
    )

    return Promise.all([adminEnforcement, ...nonAdminEnforcements])
  }
}

export interface HabitatConfig {
  clients?: EnforceClientData[]
  admin: EnforceClientData
  roles?: undefined // TODO: EnforceRoleData[]
}
