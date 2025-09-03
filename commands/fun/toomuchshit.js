const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('too-much-shit')
        .setDescription('broken shitter'),
    async execute(interaction) {
        await interaction.reply(process.env.TOO_MUCH_SHIT);
    },
};