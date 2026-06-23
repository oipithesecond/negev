const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('igotthis')
        .setDescription('death note bgm'),
    async execute(interaction) {
        const filePath = path.join(__dirname, '..', '..', 'attachments', 'igotthis.mp3');
        const file = new AttachmentBuilder(filePath);
        
        await interaction.reply({files:[file]});
    },
};