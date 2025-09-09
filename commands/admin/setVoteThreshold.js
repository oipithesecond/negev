const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const Guild = require('../../database/model');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-vote-threshold')
        .setDescription("Sets the number of 'yes' votes needed to add a song.")
        .addIntegerOption(option =>
            option
                .setName('count')
                .setDescription('The number of votes required (e.g., 3). Must be between 1 and 10.')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(10))
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const count = interaction.options.getInteger('count');

        try {
            await Guild.findOneAndUpdate(
                { guildId: interaction.guild.id },
                { voteThreshold: count },
                { upsert: true }
            );

            await interaction.editReply({ content: `The vote threshold has been set to **${count}**.` });
        } catch (error) {
            console.error("Error setting vote threshold:", error);
            await interaction.editReply({ content: 'There was an error saving the setting to the database.' });
        }
    },
};