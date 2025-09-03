const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    // 1. The command definition
    data: new SlashCommandBuilder()
        .setName('idiot')
        .setDescription('you dont think'), // Your original description

    // 2. The command logic
    async execute(interaction) {
        // It simply replies with the value from your .env file
        await interaction.reply(process.env.IDIOT);
    },
};