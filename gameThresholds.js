const GAME_THRESHOLDS = {
    "Minecraft": [
        { duration: 30 * 60 * 1000, message: "You've been crafting for 30 minutes in Minecraft! Take a moment to hydrate." },
        { duration: 60 * 60 * 1000, message: "You've been mining for an hour in Minecraft! Consider a quick break." }
    ],
    "Valorant": [
        { duration: 45 * 60 * 1000, message: "You've been in intense matches for 45 minutes in Valorant! Maybe stretch a bit." },
        { duration: 90 * 60 * 1000, message: "You've been in the zone for 1.5 hours in Valorant! Take a breather." }
    ],
    "Spotify": [
        { duration: 1 * 60 * 1000, message: "You just started listening on Spotify! Enjoy your music" },
        { duration: 15 * 60 * 1000, message: "You've been jamming for 15 minutes on Spotify! Maybe switch to a new playlist or take a break." },
        { duration: 90 * 60 * 1000, message: "You've been grooving for 1.5 hours on Spotify! Time to take a pause and hydrate." }
    ],
    "Default": [
        { duration: 30 * 60 * 1000, message: "You've been playing for 30 minutes! Remember to stretch and hydrate." },
        { duration: 60 * 60 * 1000, message: "You've been gaming for 1 hour! Consider taking a short break." }
    ]   
}

module.exports = GAME_THRESHOLDS