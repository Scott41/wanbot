'use strict';

module.exports = bot => {
  bot.on('message', msg => {
    if (msg.content === '@@@test') {
      msg.channel.sendMessage(msg.channel);
    }
  });
};
