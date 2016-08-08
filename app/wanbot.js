'use strict';

const fs = require('fs');
const args = require('yargs').argv;
const Discord = require('discord.js');
const auth = require('./data/auth.js');

let options = {
  catchup: 'fast'
};

// Process argv
if (args.n || args.nocatchup) {
  options.catchup = false;
}

let bot = new Discord.Client(options);
bot.setMaxListeners(100);

if (fs.existsSync(__dirname + '/commands')) {
  fs.readdirSync(__dirname + '/commands').forEach(file => {
    require('./commands/' + file)(bot);
  });
}

if (fs.existsSync(__dirname + '/events')) {
  fs.readdirSync(__dirname + '/events').forEach(file => {
    require('./events/' + file)(bot);
  });
}

bot.on('disconnected', () => {
  console.error('\n*************** DISCONNECTED ******************\n');
  console.warn('Exiting process ' + process.pid);
  process.exit(0);
});

bot.loginWithToken(auth.token)
  .then(() => {
    console.log('WANBOT_MODE::' + auth.mode);
    console.log('Wan Bot has logged in successfully.');
  })
  .catch(err => {
    console.error('ERROR logging in: ' + err);
  });
