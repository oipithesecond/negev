const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('anime-night')
        .setDescription('Double Naruto'),
    async execute(interaction) {
        await interaction.reply(process.env.ANIME_NIGHT);
    },
};