'use strict';

let logchannel = bot => {
  bot.on('message', msg => {

    if (msg.content === '/logchannel' && msg.author.username === 'Skiller') {
      console.info(msg.channel.id);
      bot.sendMessage(msg.channel, 'Successfully logged channel ID. Wan!');
    }

  });
};

module.exports = logchannel;
