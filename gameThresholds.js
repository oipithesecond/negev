const GAME_THRESHOLDS = {
    "Minecraft": [
        { duration: 2 * 60 * 1000, message: "You've been crafting for 30 minutes in Minecraft! Take a moment to hydrate." },
        { duration: 5 * 60 * 1000, message: "You've been mining for an hour in Minecraft! Consider a quick break." }
    ],
    "Valorant": [
        { duration: 2 * 60 * 1000, message: "You've been in intense matches for 45 minutes in Valorant! Maybe stretch a bit." },
        { duration: 5 * 60 * 1000, message: "You've been in the zone for 1.5 hours in Valorant! Take a breather." }
    ],
    "Default": [
        { duration: 2 * 60 * 1000, message: "You've been playing for 30 minutes! Remember to stretch and hydrate." },
        { duration: 5 * 60 * 1000, message: "You've been gaming for 1 hour! Consider taking a short break." }
    ]   
}

module.exports = GAME_THRESHOLDS