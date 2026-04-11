const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('manchester')
        .setDescription('burn my children'),
    async execute(interaction) {
        await interaction.reply(process.env.MANCHESTER);
    },
};