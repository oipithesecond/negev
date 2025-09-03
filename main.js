// index.js
const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
require('dotenv').config();

// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});
client.userActivityMap = new Map();

// --- DYNAMIC COMMANDS HANDLER ---
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

// --- DYNAMIC EVENTS HANDLER ---
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
    // Access the shared map from the client
    const userActivityMap = client.userActivityMap;
    if (!userActivityMap) return; // a safety check

    const currentTime = Date.now();
    for (const [userId, value] of userActivityMap) {
        const { trackedGame, startTime, notifiedThresholds } = value;
        const elapsedTime = currentTime - startTime;

        const user = await client.users.fetch(userId).catch(() => null);
        if (!user) {
            userActivityMap.delete(userId); // Clean up if user is not found
            continue;
        }

        const thresholds = GAME_THRESHOLDS[trackedGame] || GAME_THRESHOLDS["Default"];
        for (const threshold of thresholds) {
            if (elapsedTime >= threshold.duration && !notifiedThresholds.includes(threshold.duration)) {
                // Find the guild the user is in
                const guild = client.guilds.cache.find(g => g.members.cache.has(userId));
                if (!guild) continue;

                const guildData = await Guild.findOne({ guildId: guild.id });
                if (guildData && guildData.channelId) {
                    const channel = await client.channels.fetch(guildData.channelId).catch(() => null);
                    if (channel) {
                        channel.send(`${user.username}, ${threshold.message}`);
                        notifiedThresholds.push(threshold.duration);
                        console.log(`Alert sent via interval to ${user.username} in ${channel.name}`);
                    }
                }
            }
        }
    }
}, 60 * 1000); // 60 seconds


// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);