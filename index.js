const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent
  ]
});

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith('!play')) {
    const query = message.content.replace('!play', '').trim();
    if (!query) return message.reply('Please type a song name or link!');

    const vc = message.member.voice.channel;
    if (!vc) return message.reply('Join a voice channel first!');

    const result = await ytSearch(query);
    const video = result.videos.length ? result.videos[0] : null;
    if (!video) return message.reply('No results found.');

    const stream = ytdl(video.url, { filter: 'audioonly' });
    const resource = createAudioResource(stream);
    const player = createAudioPlayer();

    const connection = joinVoiceChannel({
      channelId: vc.id,
      guildId: vc.guild.id,
      adapterCreator: vc.guild.voiceAdapterCreator,
    });

    connection.subscribe(player);
    player.play(resource);

    message.reply(`🎶 Now playing: **${video.title}**`);
  }

  if (message.content === '!stop') {
    const vc = message.member.voice.channel;
    if (!vc) return message.reply('Join a voice channel first!');
    vc.leave();
    message.reply('🛑 Music stopped.');
  }
});

client.login(process.env.TOKEN);
