const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kys')
        .setDescription('daily affirmations'),
    async execute(interaction) {
        await interaction.reply(process.env.KYS);
    },
};