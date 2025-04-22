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
        if (month === 4 && day === 22) {
            return message.channel.send("https://media.discordapp.net/attachments/1020047166997266517/1364232662289481819/caption.gif?ex=6808ec2c&is=68079aac&hm=324c55fa0e383bc0c07cd5456af9a16c99380c7d0e9dcd7b6ad1e67e7c0be3e0&=&width=188&height=300");
        }
        else if (month === 7 && day === 7) {
            return message.channel.send("https://cdn.discordapp.com/attachments/1020047166997266517/1364232415244980297/neverkillyourself.mp4?ex=6808ebf2&is=68079a72&hm=954742819d93e01c8075f490be675674a9a165eed7c9e18fe37821fb6546b23c&");
        }
        else {
            return message.channel.send("Hi there! Use **/alerts-channel** to set up the bot");
        }
    }
    
    if (message.content.toLowerCase().includes("yomtun")) {
        message.channel.send("https://media.discordapp.net/attachments/1020047166997266517/1147213123644821565/OzBohIhN.gif?ex=67d30dfa&is=67d1bc7a&hm=f85c4447d3a691672ea24f62373b81076c3cac22405cb1c5c7ffdc921e979ab3&=");
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
            await interaction.reply("https://media.discordapp.net/attachments/1020047166997266517/1132358153066004530/image.png?ex=67d267f5&is=67d11675&hm=f51b3ad794fb3ca202fc8bbe13517d71fb2283278d4654c7a83787d1f85c2989&=&format=webp&quality=lossless")
        } else if (interaction.commandName === "too-much-shit"){
            await interaction.reply("https://media.discordapp.net/attachments/1020047166997266517/1349423848239661117/9n58bl.jpg?ex=67d30c64&is=67d1bae4&hm=71f3512ba88ddf4b797c9c253781be161cd595ceab235d02f81932346bfefc82&=&format=webp&width=418&height=696")
        } else if (interaction.commandName === "idiot") {
            await interaction.reply("https://cdn.discordapp.com/attachments/1020047166997266517/1135125981091344415/Video.Guru_20230730_135435693.mp4?ex=67d29673&is=67d144f3&hm=399111b0e551533ac74d1a03dbc6668479db5065ff9a57232ab6725ca56367ce&")
        } else if(interaction.commandName === "idc") {
            await interaction.reply("https://media.discordapp.net/attachments/1020047166997266517/1126929871478726696/image.png?ex=67d26efa&is=67d11d7a&hm=0a26edc291d944ddcbe33e51bfafd1096dbcb271fb587f2e141f9eba84f57415&=&format=webp&quality=lossless")
        } else if(interaction.commandName === "movie-night") {
            await interaction.reply("https://media.discordapp.net/attachments/1020047166997266517/1134542352778805248/image.png?ex=67d27127&is=67d11fa7&hm=5914ca5ed633d9eacb2c6f6d6be03963ed0feead6b031497273a316513ad5dca&=&format=webp&quality=lossless")
        }
    }
});
client.login(TOKEN);
