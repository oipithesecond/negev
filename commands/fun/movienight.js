const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('movie-night')
        .setDescription('uri attack'),
    async execute(interaction) {
        await interaction.reply(process.env.MOVIE_NIGHT);
    },
};