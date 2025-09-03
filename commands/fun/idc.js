const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('idc')
        .setDescription('smug ass cat'),
    async execute(interaction) {
        await interaction.reply(process.env.IDC);
    },
};