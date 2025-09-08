# Negev

Negev is a multi-purpose Discord bot designed to enhance server engagement through game activity tracking, a collaborative Spotify playlist feature, and a vibe-aware AI chatbot powered by Google's Gemini.

## Features
- Monitors game playtime and sends gentle reminders to users to take breaks.
- Allows users to vote on adding their currently playing song to a shared server playlist.
- Engages in context-aware conversations by analyzing the recent chat history to match the channel's "vibe."

## Usage

### Slash Commands
- `/ping`: Check if the bot is online.
- `/alerts-channel <channel>`: Specify the channel where activity alerts will be sent.
- `/add-to-playlist` : Inititiate voting process for a song.

### Manual Testing
- Ping the bot in any text channel where the bot is active to test basic functionality.
- Trigger the AI using trigger phase `sakura, `

## Environment Variables

```
--- Core Bot Credentials ---
DISCORD_TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_bot_client_id
MONGO_URI=your_mongodb_connection_string

--- AI Chatbot ---
GEMINI_API_KEY=your_google_ai_studio_api_key
SAKURA_VIBE_PROMPT="You are a Discord bot named Sakura...(Customize this master prompt as per your choice)"

--- Spotify Playlist Adder ---
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REFRESH_TOKEN=your_generated_spotify_refresh_token
SPOTIFY_PLAYLIST_ID=the_id_of_your_target_playlist

```

## Bot Permissions
Ensure the bot has the following permissions:
- Manage Channels
- Send Messages
- Read Message History
- Use Slash Commands
