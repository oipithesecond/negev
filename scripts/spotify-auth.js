const SpotifyWebApi = require('spotify-web-api-node');
const readline = require('readline');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const scopes = ['playlist-modify-public', 'playlist-modify-private'];
const redirectUri = 'https://www.google.com/'; 
const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

const spotifyApi = new SpotifyWebApi({ redirectUri, clientId, clientSecret });

const authorizeURL = spotifyApi.createAuthorizeURL(scopes);
console.log('--- PLEASE DO THE FOLLOWING ---');
console.log('1. Use the foolproof copy-paste method described in the guide.');
console.log('\n--- AUTHORIZATION URL ---');
console.log(authorizeURL);
console.log('---------------------------\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Please paste the authorization code from the URL here: ', (code) => {
  // --- NEW DEBUGGING LINE ---
  console.log('\n--- Verifying the code you pasted ---');
  console.log(code.trim()); // .trim() removes any accidental whitespace
  console.log('-------------------------------------\n');
  // --- END OF DEBUGGING LINE ---

  spotifyApi.authorizationCodeGrant(code.trim()).then(
    function(data) {
      console.log('\n--- SUCCESS! ---');
      console.log('Your REFRESH TOKEN is:');
      console.log(data.body['refresh_token']);
      console.log('--- SAVE THIS IN YOUR .ENV FILE ---');
      rl.close();
      process.exit(0);
    },
    function(err) {
      console.log('Something went wrong!', err);
      rl.close();
      process.exit(1);
    }
  );
});