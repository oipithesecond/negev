const { Events } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;

        const triggerPhrase = "sakura,";
        const messageContent = message.content.trim();

        if (messageContent.toLowerCase().startsWith(triggerPhrase)) {
            // Get the actual user prompt by removing the trigger phrase
            const userQuery = messageContent.substring(triggerPhrase.length).trim();

            // Show that the bot is "typing..."
            await message.channel.sendTyping();

            try {
                // Fetch the last 15 messages to get context
                const history = await message.channel.messages.fetch({ limit: 15 });
                const formattedHistory = history.reverse()
                    .filter(msg => msg.content && !msg.author.bot) // Filter out empty messages and bots
                    .map(msg => `${msg.author.username}: ${msg.content}`)
                    .join('\n');

                const masterPrompt = `
You are a Discord bot named Sakura. Your personality should match the vibe of the following chat conversation.
Analyze the tone, slang, humor, and sentence length of the users and adopt that style in your response.
Do not be a generic, overly polite AI. Be natural and fit in with the conversation.

Here is the recent chat history for context:
---
${formattedHistory}
---

Now, respond to the following message in that same style:
${message.author.username}: ${userQuery}
`;

                const result = await model.generateContent(masterPrompt);
                const response = await result.response;
                const text = response.text();

                // Reply directly to the user's message
                await message.reply(text);

            } catch (error) {
                console.error("Error with Gemini vibe-chat:", error);
                await message.reply("Sorry, my brain short-circuited. Please try again.");
            }
            return; // Stop processing after handling the AI chat
        }

        const now = new Date();
        const day = now.getDate();
        const month = now.getMonth() + 1;

        if (message.mentions.has(message.client.user)) {
            if (month == process.env.BMONTH_A && day == process.env.BDAY_A) {
                return message.channel.send(process.env.BDAYmedia_A);
            } else if (month == process.env.BMONTH_O && day == process.env.BDAY_O) {
                return message.channel.send(process.env.BDAYmedia_O);
            } 
        }
        if (message.mentions.has(message.client.user) && !message.reference) {
            return message.channel.send("Hi there! Use `/alerts-channel` to set up the bot.");
        }

        if (message.content.toLowerCase().includes("yomtun")) {
            message.channel.send(process.env.YOMTUN);
        }
        if (message.content.toLowerCase().includes("what do we live for")) {
            message.channel.send(process.env.HYPE_MOMENTS);
        }
    },
};