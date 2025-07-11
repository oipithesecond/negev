const { Client, GatewayIntentBits, ChannelType, ActivityType } = require('discord.js');
const { Guild } = require('./model');
const GAME_THRESHOLDS = require('./gameThresholds');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const TOKEN = process.env.DISCORD_TOKEN;
const userActivityMap = new Map();

client.once('ready', () => {
    console.log(`${client.user.tag} is online!`);
});

client.on("messageCreate", message => {
    if (message.author.bot) return;
    
    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth() + 1; 
    
    if (message.mentions.has(client.user)) {
        console.log(day);
        console.log(month);
        if (month == process.env.BMONTH_A && day == process.env.BDAY_A) {
            return message.channel.send(process.env.BDAYmedia_A);
        }
        else if (month == process.env.BMONTH_O && day == process.env.BDAY_O) {
            return message.channel.send(process.env.BDAYmedia_O);
        }
        else {
            return message.channel.send("Hi there! Use **/alerts-channel** to set up the bot");
        }
    }
    
    if (message.content.toLowerCase().includes("yomtun")) {
        message.channel.send(process.env.YOMTUN);
    }
    if (message.content.toLowerCase().includes("what do we live for")) {
        message.channel.send(process.env.HYPE_MOMENTS);
    }
});

client.on('presenceUpdate', async (oldPresence, newPresence) => {
    const user = newPresence.user;
    if (user.bot) {
        console.log(`Ignoring bot activity: ${user.username}`);
        return;
    }
    const activities = newPresence.activities;

    if (activities && activities.length > 0) {
        console.log("Activities Detected:", activities.map(a => a.name));
        const playingActivity = activities.find(activity => 
            activity.type === ActivityType.Playing || activity.name);
        if (!playingActivity) {
            console.log("No 'PLAYING' activity detected!");
        }

        if (playingActivity) {
            const currentTime = Date.now();
            const gameName = playingActivity.name;

            const thresholds = GAME_THRESHOLDS[gameName] || GAME_THRESHOLDS["Default"];

            if (userActivityMap.has(user.id)) {
                const { trackedGame, startTime, notifiedThresholds } = userActivityMap.get(user.id);

                if (trackedGame === gameName) {
                    const elapsedTime = currentTime - startTime;
                    console.log(`Elapsed time for ${gameName}: ${elapsedTime} ms`);

                    for (const threshold of thresholds) {
                        if (elapsedTime >= threshold.duration && !notifiedThresholds.includes(threshold.duration)) {
                            const guildId = newPresence.guild.id;
                            const guildData = await Guild.findOne({ guildId });
    
                            if (guildData) {
                                const channel = await client.channels.fetch(guildData.channelId).catch(() => null);
                                if (channel) channel.send(`${user.username}, ${threshold.message}`);
                            }
    
                            notifiedThresholds.push(threshold.duration);
                        }
                    }
                } else {
                    userActivityMap.set(user.id, { 
                        trackedGame: gameName, 
                        startTime: currentTime, 
                        notifiedThresholds: [] 
                    });
                    console.log(`Game switched for ${user.username}: ${trackedGame} -> ${gameName}`);
                }
            } else {
                console.log(`Starting new tracking for ${user.username} in game ${gameName}`);
                userActivityMap.set(user.id, { 
                    trackedGame: gameName, 
                    startTime: currentTime, 
                    notifiedThresholds: [] 
                });
                console.log(`Tracking initialized for ${user.username}: ${gameName}`);
            }
        } else {
            userActivityMap.delete(user.id);
        }
    } else {
        console.log("No activities detected for user:", newPresence.user.username);
        userActivityMap.delete(user.id);
    }
});

async function getGuildAlertChannel(guildId) {
    try {
        const guildData = await Guild.findOne({ guildId });
        return guildData ? guildData.alertChannelId : null;
    } catch (error) {
        console.error(`Error fetching guild alert channel: ${error}`);
        return null;
    }
}

setInterval(async () => {
    const currentTime = Date.now();
    for (const [userId, value] of userActivityMap) {
        const { trackedGame, startTime, notifiedThresholds } = value;
        const elapsedTime = currentTime - startTime;
        const user = client.users.cache.get(userId);
        if (!user) continue;

        console.log(`Checking elapsed time for ${user.username}: ${elapsedTime} ms`);

        const thresholds = GAME_THRESHOLDS[trackedGame] || GAME_THRESHOLDS["Default"];
        for (const threshold of thresholds) {
            if (elapsedTime >= threshold.duration && !notifiedThresholds.includes(threshold.duration)) {
                const guildId = client.guilds.cache.find(g => g.members.cache.has(userId))?.id;
                if (!guildId) continue;

                const channelId = await getGuildAlertChannel(guildId);
                if (!channelId) {
                    console.error(`No alert channel set for guild ${guildId}`);
                    continue;
                }

                const channel = await client.channels.fetch(channelId).catch(() => null);
                if (channel) {
                    channel.send(`${user.username}, ${threshold.message}`);
                    notifiedThresholds.push(threshold.duration);
                    console.log(`Alert sent to ${user.username} in ${channel.name}`);
                } else {
                    console.error(`Could not find alert channel for guild ${guildId}`);
                }
            }
        }
    }
}, 60 * 1000);

client.on("interactionCreate", async (interaction) => {
    if (interaction.isCommand()) {
        if (interaction.commandName === "ping") {
            await interaction.reply(`**Latency:** ${Date.now() - interaction.createdTimestamp}ms`);
        } else if (interaction.commandName === "alerts-channel") {
            const channel = interaction.options.getChannel("channel");
            if (channel.type === ChannelType.GuildText) {
                await Guild.findOneAndUpdate(
                    { guildId: interaction.guild.id },
                    { channelId: channel.id },
                    { upsert: true, new: true }
                );
                await interaction.reply(`Alerts will now be sent to <#${channel.id}>.`);
                console.log(`Alert channel set for guild ${interaction.guild.id}: <#${channel.id}>`);
            } else {
                await interaction.reply("Please specify a valid text channel.");
            }
        } else if (interaction.commandName === "jukebox") {
            await interaction.reply(process.env.JUKEBOX)
        } else if (interaction.commandName === "too-much-shit"){
            await interaction.reply(process.env.TOO_MUCH_SHIT)
        } else if (interaction.commandName === "idiot") {
            await interaction.reply(process.env.IDIOT)
        } else if(interaction.commandName === "idc") {
            await interaction.reply(process.env.IDC)
        } else if(interaction.commandName === "movie-night") {
            await interaction.reply(process.env.MOVIE_NIGHT)
        } else if(interaction.commandName === "obliterate") {
            await interaction.reply(process.env.OBLITERATE)
        } else if(interaction.commandName === "anime-night") {
            await interaction.reply(process.env.ANIME_NIGHT)
        } else if(interaction.commandName === "kys") {
            await interaction.reply(process.env.KYS)
        } else if(interaction.commandName === "my-honest-reaction") {
            await interaction.reply(process.env.MYHONESTREACTION)
        }
    }
});
client.login(TOKEN);
