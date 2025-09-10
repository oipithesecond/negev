const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const Guild = require('../../database/model');
const SpotifyWebApi = require('spotify-web-api-node');

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

async function getTempSpotifyToken() {
    try {
        const data = await spotifyApi.clientCredentialsGrant();
        spotifyApi.setAccessToken(data.body['access_token']);
    } catch (error) {
        console.error('Something went wrong when retrieving an access token', error);
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setplaylist')
        .setDescription('Sets the Spotify playlist for this server.')
        .addStringOption(option =>
            option
                .setName('link')
                .setDescription('The full Spotify playlist link.')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator), 

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const playlistLink = interaction.options.getString('link');

        const spotifyRegex = /https?:\/\/open\.spotify\.com\/(?:user\/[a-zA-Z0-9]+\/)?playlist\/([a-zA-Z0-9]+)/;
        const match = playlistLink.match(spotifyRegex);

        if (!match || !match[1]) {
            return interaction.editReply({ content: ' That doesn\'t look like a valid Spotify playlist link. Please provide the full link.' });
        }

        const playlistId = match[1];

        try {
            await getTempSpotifyToken();
            const playlistDetails = await spotifyApi.getPlaylist(playlistId);
            const playlistName = playlistDetails.body.name;

            if (!playlistName) {
                throw new Error("Could not retrieve playlist name.");
            }
            await Guild.findOneAndUpdate(
                { guildId: interaction.guild.id },
                {
                    spotifyPlaylistId: playlistId,
                    spotifyPlaylistName: playlistName 
                },
                { upsert: true }
            );

            await interaction.editReply({ content: `Server playlist has been set to **${playlistName}**!` });
        } catch (error) {
            console.error("Error setting playlist ID:", error);
            await interaction.editReply({ content: 'There was an error saving the playlist to the database.' });
        }
    },
};