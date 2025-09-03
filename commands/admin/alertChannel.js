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
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const channel = interaction.options.getChannel('channel');
        const guild = interaction.guild;

        try {
            await Guild.findOneAndUpdate(
                { guildId: guild.id },
                {
                    guildName: guild.name, 
                    channelId: channel.id,
                    channelName: channel.name,
                },
                { upsert: true, new: true }
            );

            await interaction.editReply(`Alerts will now be sent to ${channel}.`);
            console.log(`Alert channel set for guild ${guild}: #${channel.name}`);

        } catch (error) {
            console.error("Error setting alerts channel:", error);
            await interaction.editReply("Something went wrong while updating the database.");
        }
    },
};