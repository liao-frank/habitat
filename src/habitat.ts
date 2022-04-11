import { Client } from 'discord.js'

import { enforceClient } from './helpers/client'
import {
  GuildConfig,
  getAllClientConfigs,
  validateGuildConfigOrThrow,
} from './helpers/guild'

export class Habitat {
  readonly config: GuildConfig
  private readonly clientsPromise: Promise<Client[]>

  constructor(config: GuildConfig) {
    validateGuildConfigOrThrow(config)
    this.config = Object.freeze(config)

    const clientConfigs = getAllClientConfigs(this.config)
    this.clientsPromise = Promise.all(enforceClient(clientConfigs, this))
  }

  async getClients(excludeAdmin?: boolean): Promise<Client[]> {
    const clients = await this.clientsPromise

    if (!excludeAdmin) {
      return clients
    }

    const adminToken = this.config.admin.token
    return clients.filter((client) => client.token !== adminToken)
  }
}
