'use strict';

module.exports = bot => {
  bot.on('message', msg => {
    if (msg.content === '@@@test') {
      bot.sendMessage(msg.channel, msg.channel);
    }
  });
};
