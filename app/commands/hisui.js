'use strict';

let image = require('../services/image.service')();
const mbServer = require('../constants/appConstants').mbServer;

let hisui = bot => {
  bot.on('message', msg => {

    if (msg.content === '/hisui') {

      if (msg.channel.guild.id === mbServer && msg.channel.id !== '85002042438848512') {
        msg.channel.sendMessage('Wan! This command can only be used in the #spam-nsfw channel.');
        return;
      }

      let searchTag = 'Hisui';

      image.getByTagName(searchTag)
        .spread((result, src, tag) => {
          console.info(result, src, tag);
          if (result && src && tag) {
            let tagMsg = 'Result for **' + decodeURIComponent(tag) + '**';
            let srcMsg = '**Source:** ' + src;
            msg.channel.sendMessage(tagMsg + '\n' + srcMsg)
              .then(() => {
                msg.channel.sendMessage(result);
              });
          } else {
            msg.channel.sendMessage('Wan! I don\'t know what happened!');
          }
        })
        .catch(err => {
          msg.channel.sendMessage(err);
        });
    }
  });
};

module.exports = hisui;
