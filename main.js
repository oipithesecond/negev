
const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const connectDatabase = require('./database/connect');
const Guild = require('./database/model'); //
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

//commands handler
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

//events handler
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
    if (!userActivityMap) return; 

    const currentTime = Date.now();
    for (const [userId, value] of userActivityMap) {
        const { trackedGame, startTime, notifiedThresholds } = value;
        const elapsedTime = currentTime - startTime;

        const user = await client.users.fetch(userId).catch(() => null);
        if (!user) {
            userActivityMap.delete(userId); 
            continue;
        }

        const thresholds = GAME_THRESHOLDS[trackedGame] || GAME_THRESHOLDS["Default"];
        for (const threshold of thresholds) {
            if (elapsedTime >= threshold.duration && !notifiedThresholds.includes(threshold.duration)) {
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


client.login(process.env.DISCORD_TOKEN);