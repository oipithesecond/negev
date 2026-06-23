const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('igotthis')
        .setDescription('death note bgm'),
    async execute(interaction) {
        await interaction.deferReply();
        try {
            const filePath = path.join(__dirname, '..', '..', 'attachments', 'igotthis.mp3');
            const file = new AttachmentBuilder(filePath);
            
            await interaction.editReply({ files: [file] });
            
        } catch (error) {
            console.error('Error sending file:', error);
            await interaction.editReply({ content: 'Sorry, I ran into an issue uploading the file!' });
        }
    },
};