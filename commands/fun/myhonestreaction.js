const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('my-honest-reaction')
        .setDescription('mera khel khatam hai'),
    async execute(interaction) {
        await interaction.reply(process.env.MYHONESTREACTION);
    },
};