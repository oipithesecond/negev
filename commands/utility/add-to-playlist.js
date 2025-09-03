const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const SpotifyWebApi = require('spotify-web-api-node');

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    refreshToken: process.env.SPOTIFY_REFRESH_TOKEN,
});

async function refreshAccessToken() {
    try {
        const data = await spotifyApi.refreshAccessToken();
        spotifyApi.setAccessToken(data.body['access_token']);
        console.log('Spotify access token refreshed!');
    } catch (err) {
        console.error('Could not refresh Spotify access token', err);
    }
}

refreshAccessToken();
setInterval(refreshAccessToken, 50 * 60 * 1000);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add-to-playlist')
        .setDescription('Starts a vote to add your currently playing Spotify song to the server playlist.'),

    async execute(interaction) {
        await interaction.deferReply(); // Defer immediately

        const VOTE_THRESHOLD = 2;
        const VOTE_TIME = 300000;

        const presence = interaction.member.presence;
        if (!presence) {
            // Use editReply for the error message
            return interaction.editReply({ content: 'I can\'t see your status. Please make sure your Discord client is active.', ephemeral: true });
        }

        const spotifyActivity = presence.activities.find(activity => activity.name === 'Spotify' && activity.type === 2);

        if (!spotifyActivity) {
            // Use editReply for this error message as well
            return interaction.editReply({ content: 'You are not currently listening to Spotify, or your activity is not shared.', ephemeral: true });
        }

        const trackId = spotifyActivity.syncId;
        const trackName = spotifyActivity.details;
        const trackArtist = spotifyActivity.state.replace(/;/g, ',');
        const trackAlbumArt = spotifyActivity.assets.largeImageURL();

        const embed = new EmbedBuilder()
            .setColor('#1DB954')
            .setTitle(`Vote to Add Song:`)
            .setDescription(`**${trackName}**\nby **${trackArtist}**`)
            .setThumbnail(trackAlbumArt)
            .setFooter({ text: `Vote ends in 5 minutes. Needs ${VOTE_THRESHOLD} votes to pass.` });

        await interaction.editReply({ embeds: [embed] });
        const voteMessage = await interaction.fetchReply();

        await voteMessage.react('👍');

        const filter = (reaction, user) => reaction.emoji.name === '👍' && !user.bot;
        const collector = voteMessage.createReactionCollector({ filter, time: VOTE_TIME });

        collector.on('collect', (reaction, user) => {
            if (reaction.count >= VOTE_THRESHOLD) {
                collector.stop('limit');
            }
        });

        collector.on('end', async (collected, reason) => {
            const finalReaction = collected.first();
            if (reason === 'limit' && finalReaction && finalReaction.count >= VOTE_THRESHOLD) {
                try {
                    await refreshAccessToken();
                    await spotifyApi.addTracksToPlaylist(process.env.SPOTIFY_PLAYLIST_ID, [`spotify:track:${trackId}`]);
                    const successEmbed = new EmbedBuilder()
                        .setColor('#1ED760')
                        .setTitle('✅ Vote Passed & Song Added!')
                        .setDescription(`**${trackName}** by **${trackArtist}** has been added to the playlist.`)
                        .setThumbnail(trackAlbumArt);
                    await voteMessage.edit({ embeds: [successEmbed], content: '' });
                } catch (err) {
                    console.error('Error adding track to Spotify:', err.body || err);
                    await voteMessage.edit({ content: '❌ Vote passed, but I failed to add the song to Spotify. (Check console for errors)', embeds: [] });
                }
            } else {
                const failEmbed = new EmbedBuilder()
                    .setColor('#F04747')
                    .setTitle('❌ Vote Failed')
                    .setDescription(`The vote for **${trackName}** did not reach ${VOTE_THRESHOLD} votes.`)
                    .setThumbnail(trackAlbumArt);
                await voteMessage.edit({ embeds: [failEmbed], content: '' });
            }
            await voteMessage.reactions.removeAll().catch(error => console.error('Failed to clear reactions:', error));
        });
    },
};