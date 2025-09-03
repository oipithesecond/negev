const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    // Command definition
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription("Replies with the bot's latency."),

    // Command logic
    async execute(interaction) {
        // The logic is the same as your original file
        await interaction.reply(`**Latency:** ${Date.now() - interaction.createdTimestamp}ms`);
    },
};