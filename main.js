const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
    ],
});

const TOKEN = process.env.DISCORD_TOKEN;

// Configuration for game-specific thresholds and messages
const GAME_THRESHOLDS = {
    "Minecraft": [
        { duration: 2 * 60 * 1000, message: "You've been crafting for 30 minutes in Minecraft! Take a moment to hydrate." },
        { duration: 5 * 60 * 1000, message: "You've been mining for an hour in Minecraft! Consider a quick break." }
    ],
    "Valorant": [
        { duration: 2 * 60 * 1000, message: "You've been in intense matches for 45 minutes in Valorant! Maybe stretch a bit." },
        { duration: 5 * 60 * 1000, message: "You've been in the zone for 1.5 hours in Valorant! Take a breather." }
    ],
    "Default": [
        { duration: 2 * 60 * 1000, message: "You've been playing for 30 minutes! Remember to stretch and hydrate." },
        { duration: 5 * 60 * 1000, message: "You've been gaming for 1 hour! Consider taking a short break." }
    ]   
};

// Store user activity data
const userActivityMap = new Map();

client.once('ready', () => {
    console.log(`${client.user.tag} is online!`);
});

client.on('presenceUpdate', (oldPresence, newPresence) => {
    const user = newPresence.user;
    const activities = newPresence.activities;

    if (activities && activities.length > 0) {
        // Check for playing activity
        const playingActivity = activities.find(activity => activity.type === 'PLAYING');

        if (playingActivity) {
            const currentTime = Date.now();
            const gameName = playingActivity.name;

            // Get the thresholds for the current game or use the default
            const thresholds = GAME_THRESHOLDS[gameName] || GAME_THRESHOLDS["Default"];

            // Check if the user is already being tracked
            if (userActivityMap.has(user.id)) {
                const { trackedGame, startTime, notifiedThresholds } = userActivityMap.get(user.id);

                if (trackedGame === gameName) {
                    const elapsedTime = currentTime - startTime;

                    // Check thresholds
                    for (const threshold of thresholds) {
                        if (elapsedTime >= threshold.duration && !notifiedThresholds.includes(threshold.duration)) {
                            const channel = newPresence.guild.channels.cache.find(
                                ch => ch.type === 0 && ch.permissionsFor(client.user).has('SEND_MESSAGES')
                            );
                            if (channel) {
                                channel.send(`${user.username}, ${threshold.message}`);
                            }

                            // Mark this threshold as notified
                            notifiedThresholds.push(threshold.duration);
                        }
                    }
                } else {
                    // If the user switches games, reset tracking
                    userActivityMap.set(user.id, { 
                        trackedGame: gameName, 
                        startTime: currentTime, 
                        notifiedThresholds: [] 
                    });
                }
            } else {
                // Start tracking the new activity
                userActivityMap.set(user.id, { 
                    trackedGame: gameName, 
                    startTime: currentTime, 
                    notifiedThresholds: [] 
                });
            }
        } else {
            // If the user stops playing, remove them from tracking
            userActivityMap.delete(user.id);
        }
    } else {
        // Remove user from tracking if no activity is detected
        userActivityMap.delete(user.id);
    }
});

client.login(TOKEN);
