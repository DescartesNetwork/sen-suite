import axios from 'axios'

import deplConfig from '@/configs/depl.config'

export const getInteractSocials = (socialName: string) => {
  switch (socialName) {
    case 'Telegram':
      return getJoinersTelegram()

    case 'Youtube':
      return getSubYoutube()

    case 'Discord':
      return getJoinersDiscord()

    case 'Github':
      return getRepoGithub()

    case 'Twitter':
      return getFollowsTwitter()
  }
}

const getSubYoutube = async () => {
  const youtubeTokenAPI = deplConfig.youtubeTokenAPI
  const youtubeUser = 'UC7P7lwc-6sLEr0yLzWfFUyg'
  const { data } = await axios.get(
    `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${youtubeUser}&key=${youtubeTokenAPI}`,
  )
  const subYtb = parseInt(data['items'][0].statistics.subscriberCount)

  return subYtb
}

const getFollowsTwitter = async () => {
  const twitterTokenAPI = deplConfig.twitterTokenAPI
  const twitterUser = 'SentreProtocol'
  const { data } = await axios.get(
    `https://api.twitter.com/1.1/users/show.json?screen_name=${twitterUser}`,
    {
      headers: {
        Authorization: 'Bearer ' + twitterTokenAPI,
      },
    },
  )
  const followers = data.followers_count

  return followers
}

const getJoinersTelegram = async () => {
  const telegramTokenAPI = deplConfig.telegramTokenAPI
  const telegramUser = '@SentreAnnouncements'
  const { data } = await axios.get(
    `https://api.telegram.org/bot${telegramTokenAPI}/getChatMembersCount?chat_id=${telegramUser}`,
  )
  const joiners = data.result

  return joiners
}

const getJoinersDiscord = async () => {
  const discordID = 'VD7UBAp2HN'
  const { data } = await axios.get(
    `https://discord.com/api/v9/invites/${discordID}?with_counts=true&with_expiration=true`,
  )
  const joiners = data.approximate_member_count

  return joiners
}

const getRepoGithub = async () => {
  const githubUser = 'DescartesNetwork'
  const { data } = await axios.get(`https://api.github.com/users/${githubUser}`)
  const repositories = data.public_repos

  return repositories
}
