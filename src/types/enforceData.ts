import { SlashCommandBuilder } from '@discordjs/builders'
import { Habitat } from '@habitat'
import {
  ActivityOptions,
  ClientOptions,
  ClientUserEditData,
  CommandInteraction,
  PartialRoleData,
  PresenceData,
} from 'discord.js'

export interface EnforceClientData {
  activity?: ActivityOptions
  commands?: EnforceCommandData[]
  options?: ClientOptions
  presence?: PresenceData
  roles?: undefined // TODO: EnforceRoleData[]
  token: string
  userData?: ClientUserEditData
}

export interface EnforceCommandData {
  command: SlashCommandBuilder
  handler: (interaction: CommandInteraction, habitat: Habitat) => void
}

export interface EnforceRoleData {
  data: PartialRoleData
}
