const { SlashCommandBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const Guild = require('../../database/model.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('alerts-channel')
        .setDescription('Sets the channel for game activity alerts.')
        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('The text channel to send alerts in.')
                .addChannelTypes(ChannelType.GuildText) // Ensures only text channels can be selected
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator), // Only admins can use this

    async execute(interaction) {
        // Defer reply for potentially slow database operations
        await interaction.deferReply({ ephemeral: true });

        const channel = interaction.options.getChannel('channel');
        const guildId = interaction.guild.id;

        try {
            // Find the guild's configuration and update it, or create a new one
            await Guild.findOneAndUpdate(
                { guildId: guildId },
                { channelId: channel.id },
                { upsert: true, new: true }
            );

            await interaction.editReply(`✅ Alerts will now be sent to ${channel}.`);
            console.log(`Alert channel set for guild ${guildId}: #${channel.name}`);

        } catch (error) {
            console.error("Error setting alerts channel:", error);
            await interaction.editReply("❌ Something went wrong while updating the database.");
        }
    },
};