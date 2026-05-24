const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('felineattempt')
        .setDescription('stupid shrat'),
    async execute(interaction) {
        await interaction.reply(process.env.STUPIDFELINE);
    },
};