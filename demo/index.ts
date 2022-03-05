import { SimpleClient } from '@habitat'

const main = async () => {
  const client = SimpleClient.get('test')

  await client.ready
  console.log(`Logged in as ${client.user?.tag}!`)

  const guild = client.guilds.cache.get('949743387840483328')
  const roles = guild?.roles.cache || []

  for (const [, role] of roles) {
    if (role.managed) {
      role.edit({ name: 'Joe' })
    }
  }
}

main()
