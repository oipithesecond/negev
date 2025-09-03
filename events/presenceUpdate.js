const { Events, ActivityType } = require('discord.js');
const Guild = require('../database/model.js');
const GAME_THRESHOLDS = require('../config/gameThresholds');

module.exports = {
    name: Events.PresenceUpdate,
    async execute(oldPresence, newPresence) {
        const user = newPresence.user;
        if (user.bot) return;

        // Get the shared map from the client object
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
                            const guildData = await Guild.findOne({ guildId: newPresence.guild.id });
                            if (guildData) {
                                const channel = await newPresence.client.channels.fetch(guildData.channelId).catch(() => null);
                                if (channel) {
                                    channel.send(`${user.username}, ${threshold.message}`);
                                    notifiedThresholds.push(threshold.duration);
                                }
                            }
                        }
                    }
                } else {
                    // Game switched, reset tracking for the user
                    userActivityMap.set(user.id, {
                        trackedGame: gameName,
                        startTime: currentTime,
                        notifiedThresholds: []
                    });
                }
            } else {
                // Start new tracking for the user
                userActivityMap.set(user.id, {
                    trackedGame: gameName,
                    startTime: currentTime,
                    notifiedThresholds: []
                });
            }
        } else {
            // User is no longer playing, remove them from tracking
            userActivityMap.delete(user.id);
        }
    },
};