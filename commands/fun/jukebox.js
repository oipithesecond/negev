const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('jukebox')
        .setDescription('ok schizo'),
    async execute(interaction) {
        await interaction.reply(process.env.JUKEBOX);
    },
};