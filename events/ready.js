const { Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`${client.user.tag} is online!`);
        console.log(`Tracking in ${client.guilds.cache.size} guilds`);
    },
};