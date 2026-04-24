const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('movie-night')
        .setDescription('uri attack'),
    async execute(interaction) {
        await interaction.reply(`REMINDER: No movie night will take place if movie is started after 22:00 IST. \n\n${process.env.MOVIE_NIGHT}`);
    },
};