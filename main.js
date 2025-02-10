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
    console.log("Guilds:", client.guilds.cache.map(g => `${g.name} (${g.id})`).join(", "));
});

client.on("messageCreate", message => {
    if (message.content === "@894614880877948968") {
        message.channel.send("Hi there! Use **/alerts-channel** to set up the bot");
    }
})

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
                                const channel = client.channels.cache.get(guildData.channelId);
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

setInterval(() => {
    const currentTime = Date.now();
    userActivityMap.forEach((value, userId) => {
        const { trackedGame, startTime, notifiedThresholds } = value;
        const elapsedTime = currentTime - startTime;
        const user = client.users.cache.get(userId);
        console.log(`Checking elapsed time for ${user.username}: ${elapsedTime} ms`);

        const thresholds = GAME_THRESHOLDS[trackedGame] || GAME_THRESHOLDS["Default"];
        thresholds.forEach(threshold => {
            if (elapsedTime >= threshold.duration && !notifiedThresholds.includes(threshold.duration)) {
                const guildId = client.guilds.cache.find(g => g.members.cache.has(userId))?.id;
                const channelId = guildAlertChannels.get(guildId);

                if (channelId) {
                    const channel = client.channels.cache.get(channelId);
                    if (channel) {
                        channel.send(`${user.username}, ${threshold.message}`);
                        notifiedThresholds.push(threshold.duration);
                        console.log(`Alert sent to ${user.username} in ${channel.name}`);
                    } else {
                        console.error(`Could not find alert channel for guild ${guildId}`);
                    }
                } else {
                    console.error(`No alert channel set for guild ${guildId}`);
                }
            }
        });
    });
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
        }
    }
});
client.login(TOKEN);
