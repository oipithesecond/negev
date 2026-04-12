# Negev

Negev is a multi-purpose Discord bot designed to enhance server engagement through game activity tracking(via Rich Presence), a collaborative Spotify playlist feature, and a vibe-aware AI chatbot powered by [MiniMax M2.5](https://ollama.com/library/minimax-m2.5:cloud).

## Features
- Monitors game playtime and sends gentle reminders to users to take breaks.
- Allows users to vote on adding their currently playing song to a shared server playlist.
- Engages in context-aware conversations by analyzing the recent chat history to match the channel's "vibe."

## Usage

### Slash Commands
- `/ping`: Check if the bot is online.
- `/alerts-channel <channel>`: Specify the channel where activity alerts will be sent.
- `/add-to-playlist` : Inititiate voting process for a song.
- `/setplaylist <link>` : Set the collaborative playlist for your server
- `/set-vote-threshold <count>` : Set the minimum votes for a song to be added 

### Manual Testing
- Ping the bot in any text channel where the bot is active to test basic functionality.
- Trigger the AI using trigger phase `negev, `

## Environment Variables

```
--- Core Bot Credentials ---
DISCORD_TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_bot_client_id
MONGO_URI=your_mongodb_connection_string

--- AI Chatbot ---
OPENROUTER_API_KEY=your_openrouter_ai_api_key
NEGEV_VIBE_PROMPT="You are a Discord bot named... (Customize this master prompt as per your choice)"

--- Spotify Playlist Adder ---
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REFRESH_TOKEN=your_generated_spotify_refresh_token

```

## Bot Permissions
Ensure the bot has the following permissions:
- Manage channels
- Send messages
- Read message history
- Use slash sommands
- The account for the spotify developer application is added as a collaborator in the target playlist 


### Conversational AI API history
| Model (In-order) | Status | Reason for removal |
| :--- | :--- | :--- |
| [Google Gemini](https://aistudio.google.com/) | Retired | Strict token limits |
| [Cohere](https://dashboard.cohere.com/) | Retired | Inability to understand context |
| [Deepseek R1T2 Chimera](https://huggingface.co/tngtech/DeepSeek-TNG-R1T2-Chimera) | Retired | API Endpoint removed |
| [Arcee AI: Trinity Large](https://huggingface.co/arcee-ai/Trinity-Large-Preview) | Retired | API Endpoint removed |
| [MiniMax M2.5](https://ollama.com/library/minimax-m2.5:cloud) | **In-service** | - |