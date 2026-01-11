const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const connectDatabase = require('./database/connect');
const Guild = require('./database/model'); 
const GAME_THRESHOLDS = require('./config/gameThresholds');
require('dotenv').config();

(async () => {
    await connectDatabase();
})();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.userActivityMap = new Map();
client.cooldowns = new Collection();

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

setInterval(async () => {
    const userActivityMap = client.userActivityMap;
    if (!userActivityMap || userActivityMap.size === 0) return; 

    // Fetch all guilds that have a channel configured
    const allConfiguredGuilds = await Guild.find({ channelId: { $exists: true, $ne: null } });

    const currentTime = Date.now();

    for (const [userId, value] of userActivityMap) {
        const { trackedGame, startTime, notifiedThresholds } = value;
        const elapsedTime = currentTime - startTime;

        // Fetch user object
        const user = await client.users.fetch(userId).catch(() => null);
        if (!user) {
            userActivityMap.delete(userId); 
            continue;
        }

        const isDefault = !GAME_THRESHOLDS[trackedGame];
        const thresholds = isDefault ? GAME_THRESHOLDS["Default"] : GAME_THRESHOLDS[trackedGame];

        for (const threshold of thresholds) {
            // Check if time passed AND we haven't sent this specific alert yet
            if (elapsedTime >= threshold.duration && !notifiedThresholds.includes(threshold.duration)) {
                
                // Prepare message
                let finalMessage = threshold.message;
                if (isDefault) {
                    finalMessage = finalMessage.replace(/gaming/gi, `playing ${trackedGame}`);
                }

                // Loop through ALL configured guilds to find where this user is a member
                for (const guildConfig of allConfiguredGuilds) {
                    const guild = client.guilds.cache.get(guildConfig.guildId);
                    if (!guild) continue;

                    // Check if user is in this specific guild
                    const member = await guild.members.fetch(userId).catch(() => null);
                    
                    if (member) {
                        const channel = await client.channels.fetch(guildConfig.channelId).catch(() => null);
                        if (channel) {
                            try {
                                await channel.send(`${user.username}, ${finalMessage}`);
                                console.log(`Alert sent to ${user.username} in guild: ${guild.name}`);
                            } catch (sendError) {
                                console.error(`[Error] Could not send message to ${guild.name}: Missing Permissions.`);
                            }
                        }
                    }
                }

                // Mark as notified so we don't spam
                notifiedThresholds.push(threshold.duration);
            }
        }
    }
}, 60 * 1000); // 60 seconds

client.login(process.env.DISCORD_TOKEN);