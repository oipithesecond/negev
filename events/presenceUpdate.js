const { Events, ActivityType } = require('discord.js');

module.exports = {
    name: Events.PresenceUpdate,
    async execute(oldPresence, newPresence) {
        const user = newPresence.user;
        if (user.bot) return;

        // Ensure the client has the tracking map
        if (!newPresence.client.userActivityMap) {
            newPresence.client.userActivityMap = new Map();
        }
        const userActivityMap = newPresence.client.userActivityMap;

        // Check if the user is currently playing a game
        const playingActivity = newPresence.activities.find(activity => activity.type === ActivityType.Playing);

        if (playingActivity) {
            const currentTime = Date.now();
            const gameName = playingActivity.name;

            // Check if we are already tracking this user
            if (userActivityMap.has(user.id)) {
                const { trackedGame } = userActivityMap.get(user.id);

                // If the game changed, reset the tracker
                if (trackedGame !== gameName) {
                    userActivityMap.set(user.id, {
                        trackedGame: gameName,
                        startTime: currentTime,
                        notifiedThresholds: []
                    });
                    console.log(`[Tracker] ${user.username} switched to ${gameName}`);
                }
                // If trackedGame === gameName, do nothing. 
                // The loop in main.js handles the timer.
            } else {
                // User just started playing, begin tracking
                userActivityMap.set(user.id, {
                    trackedGame: gameName,
                    startTime: currentTime,
                    notifiedThresholds: []
                });
                console.log(`[Tracker] Started tracking ${user.username} playing ${gameName}`);
            }
        } else {
            // User stopped playing entirely, remove from map
            if (userActivityMap.has(user.id)) {
                userActivityMap.delete(user.id);
                console.log(`[Tracker] Stopped tracking ${user.username}`);
            }
        }
    },
};