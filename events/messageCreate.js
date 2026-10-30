const { Events, Collection } = require('discord.js');
module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;

        const { cooldowns } = message.client;
        const triggerPhrase = "negev,";
        const messageContent = message.content.trim();

        // 1. NEGEV AI LOGIC
        if (messageContent.toLowerCase().startsWith(triggerPhrase)) {
            // --- COOLDOWN LOGIC START ---
            const cooldownAmount = 5 * 1000; 
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

            const userQuery = messageContent.substring(triggerPhrase.length).trim();
            await message.channel.sendTyping();

            let replyText = ""; 

            try {
                // --- HISTORY FETCHING ---
                const history = await message.channel.messages.fetch({ limit: 10 });
                const formattedHistory = history.reverse()
                    .filter(msg => msg.content && !msg.author.bot)
                    .map(msg => `${msg.author.username}: ${msg.content}`)
                    .join('\n');

                // --- OPENROUTER API LOGIC ---
                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://discord.com", 
                        "X-Title": "Negev Vibe"
                    },
                    body: JSON.stringify({
                        model: "openai/gpt-oss-120b:free",
                        messages: [
                            {
                                role: "system",
                                content: `${process.env.NEGEV_VIBE_PROMPT}\n\nHere is the recent chat history for context:\n${formattedHistory}`
                            },
                            {
                                role: "user",
                                content: `${message.author.username}: ${userQuery}`
                            }
                        ],
                        temperature: 0.7,
                        max_tokens: 300
                    })
                });

                const data = await response.json();

                if (data.error) {
                    console.error("OpenRouter Error:", data.error);
                    return message.reply("My brain is fried. Try again later.");
                }

                replyText = data.choices[0].message.content || "";

                // Cleanup thought tags
                replyText = replyText.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

                if (!replyText) replyText = "...";

                await message.reply(replyText);

            } catch (error) {
                console.error(error);
                if (error.code === 50035 || error.rawError?.errors?.message_reference) {
                     await message.channel.send(`<@${message.author.id}> ${replyText || "My brain stopped working."}`);
                } else {
                     await message.channel.send("Something went wrong with my API connection.");
                }
            }
            return;
        }

        const now = new Date();
        const day = now.getDate();
        const month = now.getMonth() + 1;

        if (message.mentions.has(message.client.user)) {
            if (month == process.env.BMONTH_A && day == process.env.BDAY_A) {
                return message.channel.send(process.env.BDAYmedia);
            } else if (month == process.env.BMONTH_O && day == process.env.BDAY_O) {
                return message.channel.send(process.env.BDAYmedia);
            } 
        }

        if (message.mentions.has(message.client.user) && !message.reference) {
            return message.channel.send("Hi there! Use `/alerts-channel` to set up the bot.");
        }

        if (message.content.toLowerCase().trim() === "yomtun") {
            message.channel.send(process.env.YOMTUN);
        }
        if (message.content.toLowerCase().includes("what do we live for")) {
            message.channel.send(process.env.HYPE_MOMENTS);
        }

        const TRIGGER = 'true'; 
        const SEARCH_KEYWORD = 'morgan freeman true';
        
        if (message.content.toLowerCase().trim() === TRIGGER) {

            try{
                // fetch 30 results
                const url = `https://api.klipy.com/api/v1/${process.env.KLIPY_API_KEY}/gifs/search?q=${encodeURIComponent(SEARCH_KEYWORD)}&per_page=30`;
                const response = await fetch(url);
                const data = await response.json();
                const results = data?.data?.data || [];

                if (results && results.length > 0) {
                    // Pick a random index from the available results
                    const randomIndex = Math.floor(Math.random() * results.length);
                    const selected = results[randomIndex];
                    const gifUrl = selected.file?.hd?.gif?.url || selected.file?.md?.gif?.url || selected.file?.sm?.gif?.url; 
                    
                    message.channel.send(gifUrl);
                } else {
                    // Fallback if KLIPY has zero results for that exact phrase
                    console.log('No GIFs found for the fixed keyword.');
                }
            }catch(error){
                console.error('Error fetching GIF from KLIPY:', error);
            }
        }
    }
};