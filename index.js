require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, getVoiceConnection } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');

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

  // 🎵 Play command
  if (message.content.startsWith('!play')) {
    const query = message.content.replace('!play', '').trim();
    if (!query) return message.reply('Please type a song name or link!');

    const vc = message.member.voice.channel;
    if (!vc) return message.reply('Join a voice channel first!');

    const result = await ytSearch(query);
    const video = result.videos.length ? result.videos[0] : null;
    if (!video) return message.reply('No results found.');

    const stream = ytdl(video.url, { filter: 'audioonly', highWaterMark: 1 << 25 });
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

  // 🛑 Stop command
  if (message.content === '!stop') {
    const connection = getVoiceConnection(message.guild.id);
    if (connection) {
      connection.destroy();
      message.reply('🛑 Music stopped.');
    } else {
      message.reply('Not playing anything right now.');
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
