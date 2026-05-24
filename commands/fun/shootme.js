const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shootme')
        .setDescription('people playground'),
    async execute(interaction) {
        await interaction.reply(process.env.SHOOTME);
    },
};