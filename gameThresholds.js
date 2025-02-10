const GAME_THRESHOLDS = {
    "Minecraft": [
        { duration: 30 * 60 * 1000, message: "You've been crafting for 30 minutes in Minecraft! Take a moment to hydrate." },
        { duration: 60 * 60 * 1000, message: "You've been mining for an hour in Minecraft! Consider a quick break." },
        { duration: 120 * 60 * 1000, message: "You've been exploring for 2 hours in Minecraft! Step outside for some fresh air." }
    ],
    "Valorant": [
        { duration: 45 * 60 * 1000, message: "You've been in intense matches for 45 minutes in Valorant! Maybe stretch a bit." },
        { duration: 90 * 60 * 1000, message: "You've been in the zone for 1.5 hours in Valorant! Take a breather." },
        { duration: 150 * 60 * 1000, message: "You've been grinding for 2.5 hours in Valorant! Consider a longer break." }
    ],
    "League of Legends": [
        { duration: 40 * 60 * 1000, message: "You've been strategizing for 40 minutes in League of Legends! Stretch a bit." },
        { duration: 80 * 60 * 1000, message: "You've been in Summoner’s Rift for 80 minutes! Blink and hydrate." },
        { duration: 120 * 60 * 1000, message: "You've been battling for 2 hours in League! Stand up and move around." }
    ],
    "Genshin Impact": [
        { duration: 60 * 60 * 1000, message: "You've been exploring Teyvat for an hour in Genshin Impact! Take a small break." },
        { duration: 120 * 60 * 1000, message: "You've been adventuring for 2 hours! Time to relax a bit." },
        { duration: 180 * 60 * 1000, message: "You've been playing Genshin for 3 hours! Make sure to eat and hydrate." }
    ],
    "Fortnite": [
        { duration: 45 * 60 * 1000, message: "You've been in the battle for 45 minutes in Fortnite! Stretch those legs." },
        { duration: 90 * 60 * 1000, message: "You've been dropping into Fortnite for 1.5 hours! Take a moment to rest." },
        { duration: 150 * 60 * 1000, message: "You've been grinding Fortnite for 2.5 hours! Maybe take a longer break." }
    ],
    "Apex Legends": [
        { duration: 45 * 60 * 1000, message: "You've been in the Apex Games for 45 minutes! Keep hydrated." },
        { duration: 90 * 60 * 1000, message: "You've been playing Apex Legends for 1.5 hours! Take a short break." },
        { duration: 150 * 60 * 1000, message: "You've been battling for 2.5 hours! Rest your eyes a bit." }
    ],
    "Elden Ring": [
        { duration: 60 * 60 * 1000, message: "You've been wandering the Lands Between for an hour! Take a short rest." },
        { duration: 120 * 60 * 1000, message: "You've been battling bosses for 2 hours! Time for a break." },
        { duration: 180 * 60 * 1000, message: "You've been adventuring for 3 hours in Elden Ring! Take a long rest like a Tarnished should." }
    ],
    "CS:GO": [
        { duration: 40 * 60 * 1000, message: "You've been in CS:GO matches for 40 minutes! Blink and stretch." },
        { duration: 90 * 60 * 1000, message: "You've been playing CS:GO for 1.5 hours! Consider a short break." },
        { duration: 150 * 60 * 1000, message: "You've been in intense CS:GO matches for 2.5 hours! Step away for a breather." }
    ],
    "Dota 2": [
        { duration: 60 * 60 * 1000, message: "You've been in battle for an hour in Dota 2! Time to stretch." },
        { duration: 120 * 60 * 1000, message: "You've been defending the Ancients for 2 hours! Take a small break." },
        { duration: 180 * 60 * 1000, message: "You've been playing Dota 2 for 3 hours! Step outside for some fresh air." }
    ],
    "Spotify": [
        { duration: 90 * 60 * 1000, message: "You've been grooving for 1.5 hours on Spotify! Time to take a pause and hydrate." },
        { duration: 180 * 60 * 1000, message: "You've been jamming for 3 hours on Spotify! Give your ears some rest." }
    ],
    "Default": [
        { duration: 30 * 60 * 1000, message: "You've been playing for 30 minutes! Remember to stretch and hydrate." },
        { duration: 60 * 60 * 1000, message: "You've been gaming for 1 hour! Consider taking a short break." },
        { duration: 120 * 60 * 1000, message: "You've been gaming for 2 hours! Time for a longer rest." }
    ]   
};


module.exports = GAME_THRESHOLDS