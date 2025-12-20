const { Events, ActivityType } = require('discord.js');
const Guild = require('../database/model.js');
const GAME_THRESHOLDS = require('../config/gameThresholds');

module.exports = {
    name: Events.PresenceUpdate,
    async execute(oldPresence, newPresence) {
        const user = newPresence.user;
        if (user.bot) return;

        const userActivityMap = newPresence.client.userActivityMap;

        const playingActivity = newPresence.activities.find(activity => activity.type === ActivityType.Playing);

        if (playingActivity) {
            const currentTime = Date.now();
            const gameName = playingActivity.name;
            const thresholds = GAME_THRESHOLDS[gameName] || GAME_THRESHOLDS["Default"];

            if (userActivityMap.has(user.id)) {
                const { trackedGame, startTime, notifiedThresholds } = userActivityMap.get(user.id);

                if (trackedGame === gameName) {
                    const elapsedTime = currentTime - startTime;
                    for (const threshold of thresholds) {
                        if (elapsedTime >= threshold.duration && !notifiedThresholds.includes(threshold.duration)) {

                            notifiedThresholds.push(threshold.duration);
                            let finalMessage = threshold.message;

                            if (isDefault) {
                                finalMessage = finalMessage.replace("gaming", `playing ${gameName}`);
                            }

                            const allConfiguredGuilds = await Guild.find({ channelId: { $exists: true, $ne: null } });
                            
                            for (const guildConfig of allConfiguredGuilds) {
                                try {
                                    const guild = newPresence.client.guilds.cache.get(guildConfig.guildId);
                                    if (!guild) continue;
                                    const member = await guild.members.fetch(user.id).catch(() => null);

                                    if (member) {
                                        const channel = await guild.channels.fetch(guildConfig.channelId).catch(() => null);
                                        if (channel) {
                                            await channel.send(`${user.username}, ${threshold.message}`);
                                        }
                                    }
                                } catch (error) {
                                    console.error(`Failed to send notification to guild ${guildConfig.guildId}:`, error);
                                }
                            }
                        }
                    }
                } else {
                    // User switched games, reset tracking
                    userActivityMap.set(user.id, {
                        trackedGame: gameName,
                        startTime: currentTime,
                        notifiedThresholds: []
                    });
                }
            } else {
                // User just started playing
                userActivityMap.set(user.id, {
                    trackedGame: gameName,
                    startTime: currentTime,
                    notifiedThresholds: []
                });
            }
        } else {
            // User stopped playing
            userActivityMap.delete(user.id);
        }
    },
};