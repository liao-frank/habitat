import { Habitat, SETUP_COMMAND } from '@habitat'

const adminToken = 'OTU0MTA1Nzg5ODQ3NTg4OTI0.YjOSQg.1iYhTQlSqV_H72Xk0SB4nNs8b4s'
const testToken = 'OTQ5NTU1NDUzMTUzNjY1MDM1.YiMEbQ.nQ1c1d6qTYaDatUbXpHUWL4O_5k'

const habitat = new Habitat({
  admin: {
    commands: [SETUP_COMMAND],
    token: adminToken,
    userData: {
      username: 'Test Admin',
    },
  },
  clients: [
    {
      token: testToken,
      userData: {
        username: 'I Robot',
      },
    },
  ],
})

const main = async () => {
  await habitat.getClients()
  console.log('Clients have started up!')
}

console.log('Starting up clients...')
main()
