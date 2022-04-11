import {
  Client,
  CreateRoleOptions,
  Guild,
  GuildResolvable,
  Role,
} from 'discord.js'

import { arrayProof } from '../lib/foolproof'
import { getClientUser } from './client'

export const enforceRole = arrayProof(
  async (config: RoleConfig, guild: Guild): Promise<Role> => {
    const role = await maybeCreateRole(config, guild)

    if (config.name !== role.name) {
      role.setName(config.name)
    }

    if (config.options) {
      if (config.options.color) {
        role.setColor(config.options.color)
      }

      if (config.options.hoist !== undefined) {
        role.setHoist(config.options.hoist)
      }

      if (config.options.icon !== undefined) {
        role.setIcon(config.options.icon)
      }

      if (config.options.mentionable !== undefined) {
        role.setMentionable(config.options.mentionable)
      }

      if (config.options.permissions) {
        role.setPermissions(config.options.permissions)
      }

      if (config.options.position !== undefined) {
        role.setPosition(config.options.position)
      }

      if (config.options.unicodeEmoji !== undefined) {
        role.setUnicodeEmoji(config.options.unicodeEmoji)
      }
    }

    return role
  }
)

export const getRole = (config: RoleConfig, guild: Guild): Promise<Role> => {
  return maybeCreateRole(config, guild)
}

export const getManagedRole = async (
  client: Client,
  maybeGuild: GuildResolvable,
  adminClient?: Client
): Promise<Role> => {
  const guild = (adminClient || client).guilds.resolve(maybeGuild)
  if (!guild) throw new Error('Could not find containing guild.')

  const member = guild.members.resolve(await getClientUser(client))
  if (!member) throw new Error('Could not find guild membership.')

  const role = member.roles.cache.find((role) => role.managed)
  if (!role) throw new Error('Could not find managed role.')

  return role
}

const maybeCreateRole = async (
  config: RoleConfig,
  guild: Guild
): Promise<Role> => {
  const names = [config.name, ...config.migratedNames]
  const matcher = (role: Role) => names.includes(role.name) && role.editable

  // Check the cache first for a matching role.
  let roles = guild.roles.cache
  let role = roles.filter(matcher).first()

  if (role) {
    return role
  }

  roles = await guild.roles.fetch()
  role = roles.filter(matcher).first()

  if (role) {
    return role
  }

  const options = {
    ...config.options,
    name: config.name,
  }
  return guild.roles.create(options)
}

export interface RoleConfig {
  options?: Omit<CreateRoleOptions, 'name'>
  migratedNames: string[]
  name: string
}
