'use strict';

let admins = require('../data/admins');

let logout = bot => {
  bot.on('message', msg => {

    if (msg.content === '/go to bed') {

      let isAdmin = false;

      admins.forEach(admin => {
        if (msg.author.id == admin.id) {
          isAdmin = true;
        }
      });

      if (!isAdmin) {
        bot.sendMessage(msg.channel, 'Wan! You are not my master ' + msg.author.username + '-san!');
      } else {
        bot.sendMessage(msg.channel, 'Wan! My master ' + msg.author.username + '-sama is calling me home. Ja ne!')
          .then(() => {
            bot.logout((err) => {
              if (err) {
                console.error('ERROR logging out: ' + err);
              }
              console.warn('Disconnected by the `logout` command.');
              process.exit(0);
            });
          });
      }
    }
  });
};

module.exports = logout;
