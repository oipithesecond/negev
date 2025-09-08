const { Events, Collection } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;

        const { cooldowns } = message.client;

        const triggerPhrase = "sakura,";
        const messageContent = message.content.trim();

        if (messageContent.toLowerCase().startsWith(triggerPhrase)) {
            // --- COOLDOWN LOGIC START ---
            const cooldownAmount = 5 * 1000; // 5 seconds
            const now = Date.now();

            if (cooldowns.has(message.author.id)) {
                const expirationTime = cooldowns.get(message.author.id) + cooldownAmount;

                if (now < expirationTime) {
                    const timeLeft = (expirationTime - now) / 1000;
                    return message.reply(`Please wait ${timeLeft.toFixed(1)} more second(s) before I can think again.`);
                }
            }
            
            cooldowns.set(message.author.id, now);
            setTimeout(() => cooldowns.delete(message.author.id), cooldownAmount);
            // --- COOLDOWN LOGIC END ---

            // Get the actual user prompt by removing the trigger phrase
            const userQuery = messageContent.substring(triggerPhrase.length).trim();

            // Show that the bot is "typing..."
            await message.channel.sendTyping();

            try {
                const history = await message.channel.messages.fetch({ limit: 50 });
                const formattedHistory = history.reverse()
                    .filter(msg => msg.content && !msg.author.bot) // Filter out empty messages and bots
                    .map(msg => `${msg.author.username}: ${msg.content}`)
                    .join('\n');

                const promptTemplate = process.env.SAKURA_VIBE_PROMPT;
                const masterPrompt = promptTemplate
                    .replace('{{HISTORY}}', formattedHistory)
                    .replace('{{QUERY}}', `${message.author.username}: ${userQuery}`);

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