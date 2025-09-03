const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    // Command definition
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription("Gets a user's avatar URL.")
        .addUserOption(option => // This creates the optional 'user' parameter
            option
                .setName('user')
                .setDescription('The user whose avatar you want to get.')
                .setRequired(false)),

    // Command logic
    async execute(interaction) {
        // If a user is specified, use them. Otherwise, default to the user who ran the command.
        const user = interaction.options.getUser('user') || interaction.user;

        // Get the URL of the user's avatar
        const avatarURL = user.displayAvatarURL({ dynamic: true, size: 4096 });

        // Create a rich embed to display the avatar image
        const embed = new EmbedBuilder()
            .setColor('#ec88f7')
            .setTitle(`${user.username}'s Avatar`)
            .setImage(avatarURL)
            .setFooter({ text: `Requested by ${interaction.user.username}` });

        await interaction.reply({ embeds: [embed] });
    },
};