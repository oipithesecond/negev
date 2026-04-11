const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const SpotifyWebApi = require('spotify-web-api-node');
const Guild = require('../../database/model');

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    refreshToken: process.env.SPOTIFY_REFRESH_TOKEN,
});
const celebrationGifs = [
    'https://tenor.com/view/it%27s-mid-it%27s-peak-gif-10331198441245051584', 
    'https://tenor.com/view/ok-schizo-ok-schizo-schizophrenia-gibbon-gif-23667455'   
];

async function refreshAccessToken() {
    try {
        const data = await spotifyApi.refreshAccessToken();
        spotifyApi.setAccessToken(data.body['access_token']);
        console.log('Spotify access token refreshed!');
        return true;
    } catch (err) {
        console.error('Could not refresh Spotify access token', err);
        return false;
    }
}

refreshAccessToken();
setInterval(refreshAccessToken, 50 * 60 * 1000);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add-to-playlist')
        .setDescription('Starts a vote to add your currently playing Spotify song to the server playlist.'),

    async execute(interaction) {
        await interaction.deferReply();

        const guildData = await Guild.findOne({ guildId: interaction.guild.id });
        const VOTE_THRESHOLD = guildData?.voteThreshold || 2;
        const VOTE_TIME = 150000; // 2.5 minutes

        const presence = interaction.member.presence;
        if (!presence) {
            return interaction.editReply({ content: 'I can\'t see your status. Please make sure your Discord client is active.', ephemeral: true });
        }

        const spotifyActivity = presence.activities.find(activity => activity.name === 'Spotify' && activity.type === 2);

        if (!spotifyActivity) {
            return interaction.editReply({ content: 'You are not currently listening to Spotify, or your activity is not shared.', ephemeral: true });
        }

        const trackId = spotifyActivity.syncId;
        const trackName = spotifyActivity.details;
        const trackArtist = spotifyActivity.state.replace(/;/g, ',');
        const trackAlbumArt = spotifyActivity.assets.largeImageURL();

        console.log(`Track detected: ${trackName} by ${trackArtist} (ID: ${trackId})`);

        const embed = new EmbedBuilder()
            .setColor('#ec88f7')
            .setTitle(`Vote to Add Song to Playlist`)
            .setDescription(`**${trackName}**\nby **${trackArtist}**\n\n**Reply with "yes" to add this song**\n`)
            .setThumbnail(trackAlbumArt)
            .setFooter({ text: `Vote ends in 2 minutes. Needs ${VOTE_THRESHOLD} "yes" votes to pass.` });

        await interaction.editReply({ embeds: [embed] });
        const voteMessage = await interaction.fetchReply();

        const votes = new Map(); // userID -> vote ('yes' or 'no')
        
        // Create a collector for message replies
        const filter = m => {
            // Check if this is a reply to our vote message
            if (m.reference?.messageId !== voteMessage.id) return false;
            
            // Check if the message content is a valid vote
            const content = m.content.toLowerCase().trim();
            return (content === 'yes' || content === 'no') && !m.author.bot;
        };
        
        const collector = interaction.channel.createMessageCollector({ 
            filter, 
            time: VOTE_TIME 
        });

        collector.on('collect', m => {
            const vote = m.content.toLowerCase().trim();
            const userId = m.author.id;
            
            // Update the user's vote
            votes.set(userId, vote);
            
            console.log(`Vote received from ${m.author.tag}: ${vote}. Total voters: ${votes.size}`);
            
            // Count current votes
            let yesCount = 0;
            let noCount = 0;
            
            for (let [_, v] of votes) {
                if (v === 'yes') yesCount++;
                else if (v === 'no') noCount++;
            }
            
            console.log(`Current tally: ${yesCount} yes, ${noCount} no`);
            
            // Check for threshold
            if (yesCount >= VOTE_THRESHOLD) {
                console.log(`Vote threshold reached with ${yesCount} yes votes!`);
                collector.stop('threshold');
            }
        });

        collector.on('end', async (collected, reason) => {
            console.log(`Vote ended. Reason: ${reason}`);
            
            let yesCount = 0;
            let noCount = 0;
            
            for (let [_, vote] of votes) {
                if (vote === 'yes') yesCount++;
                else if (vote === 'no') noCount++;
            }
            
            console.log(`Final tally: ${yesCount} yes, ${noCount} no`);
            
            if (reason === 'threshold' && yesCount >= VOTE_THRESHOLD) {
                try {
                    const guildData = await Guild.findOne({ guildId: interaction.guild.id });

                    if (!guildData || !guildData.spotifyPlaylistId) {
                        return voteMessage.edit({
                            content: 'An admin has not set a server playlist yet! Use the `/setplaylist` command to set one.',
                            embeds: []
                        });
                    }
                    const playlistId = guildData.spotifyPlaylistId;
                    const playlistName = guildData.spotifyPlaylistName || "the server playlist";

                    const tokenRefreshed = await refreshAccessToken();
                    if (!tokenRefreshed) {
                        throw new Error('Failed to refresh Spotify access token');
                    }

                    if (!trackId) {
                        throw new Error('No track ID found');
                    }

                    const trackUri = `spotify:track:${trackId}`;
                    console.log(`Attempting to add track: ${trackUri} to playlist: ${playlistId}`);
                    
                    const accessToken = spotifyApi.getAccessToken();

                    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/items`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            uris: [trackUri]
                        })
                    });
                    
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(`Spotify API Error: ${response.status} - ${errorData.error?.message || 'Forbidden'}`);
                    }
                    
                    const result = { body: await response.json() };
                    console.log('Spotify API response:', result.body);
                    
                    const randomGif = celebrationGifs[Math.floor(Math.random() * celebrationGifs.length)];

                    const successEmbed = new EmbedBuilder()
                        .setColor('#ec88f7')
                        .setTitle('Vote Passed & Song Added!')
                        .setDescription(`**${trackName}** by **${trackArtist}** has been added to **${playlistName}**.\n\n**Final Vote:** ${yesCount} yes, ${noCount} no`)
                        .setThumbnail(trackAlbumArt);
                    
                    await voteMessage.edit({ 
                        embeds: [successEmbed],
                        content: ' '
                    });
                    
                    setTimeout(async () => {
                        const randomGif = celebrationGifs[Math.floor(Math.random() * celebrationGifs.length)];
                        await interaction.channel.send(randomGif);
                    }, 1000); // 1 second delay
                } catch (err) {
                    console.error('Error adding track to Spotify:', err);
                    if (err.body) {
                        console.error('Spotify API error details:', err.body);
                    }
                    
                    await voteMessage.edit({ 
                        content: ` Vote passed (${yesCount} yes, ${noCount} no), but I failed to add the song to Spotify. Please check my permissions and try again.`, 
                        embeds: [] 
                    });
                }
            } else {
                const failEmbed = new EmbedBuilder()
                    .setColor('#ec88f7')
                    .setTitle('Vote Failed')
                    .setDescription(`The vote for **${trackName}** did not reach ${VOTE_THRESHOLD} "yes" votes.\n\n**Final Vote:** ${yesCount} yes, ${noCount} no`)
                    .setThumbnail(trackAlbumArt);
                await voteMessage.edit({ 
                    embeds: [failEmbed],
                    content: '**The vote did not pass.**'
                });
            }
        });
    },
};