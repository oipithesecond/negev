const { Client, GatewayIntentBits, ChannelType, ActivityType } = require('discord.js');
const { registerSlashCommands } = require('./slash-deploy');
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
const guildAlertChannels = new Map();

client.once('ready', () => {
    console.log(`${client.user.tag} is online!`);
});

client.on("messageCreate", message => {
    if (message.content === "negev") {
        message.channel.send("based");
    }
})

client.on('presenceUpdate', (oldPresence, newPresence) => {
    const user = newPresence.user;
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
                            const channel = newPresence.guild.channels.cache.find(
                                ch => ch.type === ChannelType.GuildText && ch.permissionsFor(client.user).has('SEND_MESSAGES')
                            );
                            if (channel) {
                                console.log(`Channel found: ${channel.name}`);
                                channel.send(`${user.username}, ${threshold.message}`);
                            } else {
                                console.log("No valid text channel found!");
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

setInterval(() => {
    const currentTime = Date.now();
    userActivityMap.forEach((value, userId) => {
        const { trackedGame, startTime, notifiedThresholds } = value;
        const elapsedTime = currentTime - startTime;
        const user = client.users.cache.get(userId)
        console.log(`Checking elapsed time for ${user.username}: ${elapsedTime} ms`);

        const thresholds = GAME_THRESHOLDS[trackedGame] || GAME_THRESHOLDS["Default"];
        thresholds.forEach(threshold => {
            if (elapsedTime >= threshold.duration && !notifiedThresholds.includes(threshold.duration)) {
                const user = client.users.cache.get(userId);
                if (user) {
                    console.log(`Sending message to ${user.username}`);
                    const channel = client.channels.cache.find(
                        ch => ch.type === ChannelType.GuildText && ch.permissionsFor(client.user).has('SEND_MESSAGES')
                    );
                    if (channel) {
                        channel.send(`${user.username}, ${threshold.message}`);
                        notifiedThresholds.push(threshold.duration);
                    }
                }
            }
        });
    });
}, 60 * 1000);

client.on("interactionCreate", async (interaction) => {
    if (interaction.isCommand()) {
        if (interaction.commandName === "ping") {
            await interaction.reply("pong");
        } else if (interaction.commandName === "alerts-channel") {
            const channel = interaction.options.getChannel("channel");
            if (channel.type === ChannelType.GuildText) {
                alertsChannelId = channel.id;
                await interaction.reply(`Alerts will now be sent to <#${channel.id}>.`);
            } else {
                await interaction.reply("Please specify a valid text channel.");
            }
        }
    }
});
client.login(TOKEN);
