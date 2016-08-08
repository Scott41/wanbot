'use strict';

let image = require('../services/image.service')();
const mbServer = require('../constants/appConstants').mbServer;

let hisui = bot => {
  bot.on('message', msg => {

    if (msg.content === '/hisui') {

      if (msg.channel.server.id === mbServer && msg.channel.id !== '85002042438848512') {
        bot.sendMessage(msg.channel, 'Wan! This command can only be used in the #spam-nsfw channel.');
        return;
      }

      let searchTag = 'Hisui';

      image.getByTagName(searchTag)
        .spread((result, src, tag) => {
          console.info(result, src, tag);
          if (result && src && tag) {
            let tagMsg = 'Result for **' + decodeURIComponent(tag) + '**';
            let srcMsg = '**Source:** ' + src;
            bot.sendMessage(msg.channel, tagMsg + '\n' + srcMsg)
              .then(() => {
                bot.sendMessage(msg.channel, result);
              });
          } else {
            bot.sendMessage(msg.channel, 'Wan! I don\'t know what happened!');
          }
        })
        .catch(err => {
          bot.sendMessage(msg.channel, err);
        });
    }
  });
};

module.exports = hisui;
