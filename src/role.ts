import { Client, Guild, GuildResolvable, Role } from 'discord.js'
import { getClientUser } from './client'

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
