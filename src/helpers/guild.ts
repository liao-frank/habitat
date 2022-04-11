import { Guild } from 'discord.js'
import isEqual from 'lodash/isEqual'

import { ClientConfig } from './client'
import { RoleConfig, enforceRole } from './role'

export const enforceGuild = async (
  guild: Guild,
  config: GuildConfig
): Promise<Guild> => {
  // Enforce roles.
  const roleConfigs = getAllRoleConfigs(config)
  enforceRole(roleConfigs, guild)

  return guild
}

export const getAllClientConfigs = (
  guildConfig: GuildConfig
): ClientConfig[] => {
  const nonAdminConfigs = guildConfig.clients || []
  return [guildConfig.admin, ...nonAdminConfigs]
}

export const getAllRoleConfigs = (guildConfig: GuildConfig): RoleConfig[] => {
  const topLevelRoleConfigs = guildConfig.roles || []

  const clientConfigs = getAllClientConfigs(guildConfig)
  const nestedRoleConfigs = clientConfigs.flatMap(
    (config) => config.roles || []
  )

  return [...topLevelRoleConfigs, ...nestedRoleConfigs]
}

export const validateGuildConfigOrThrow = (guildConfig: GuildConfig): void => {
  // Validate client token uniqueness.
  const clientConfigs = getAllClientConfigs(guildConfig)
  const clientTokens = new Set()

  for (const clientConfig of clientConfigs) {
    const { token } = clientConfig

    if (clientTokens.has(token)) {
      throw new Error('Found duplicate token in client configs: ' + token)
    }

    clientTokens.add(token)
  }

  // Validate role name uniqueness.
  const roleConfigs = getAllRoleConfigs(guildConfig)
  const nameToRoleConfigMap = new Map<string, RoleConfig>()

  for (const roleConfig of roleConfigs) {
    const names = [roleConfig.name, ...roleConfig.migratedNames]

    for (const name of names) {
      const matchingConfig = nameToRoleConfigMap.get(name)

      if (matchingConfig && !isEqual(matchingConfig, roleConfig)) {
        throw new Error('Found duplicate name in role configs: ' + name)
      }

      nameToRoleConfigMap.set(name, roleConfig)
    }
  }
}

export interface GuildConfig {
  clients?: ClientConfig[]
  admin: ClientConfig
  roles?: RoleConfig[]
}
