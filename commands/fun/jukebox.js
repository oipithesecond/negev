const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('jukebox')
        .setDescription('you dont think'),
    async execute(interaction) {
        await interaction.reply(process.env.JUKEBOX);
    },
};