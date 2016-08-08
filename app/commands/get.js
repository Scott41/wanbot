'use strict';

let imageService = require('../services/image.service')();
const errors = require('../constants/appConstants').errors;
const mbServer = require('../constants/appConstants').mbServer;

let get = bot => {
  bot.on('message', msg => {

    if (msg.content.indexOf('/get') === 0) {

      if (msg.channel.server.id === mbServer && msg.channel.id !== '85002042438848512') {
        return bot.sendMessage(msg.channel, 'Wan! This command can only be used in the #spam-nsfw channel.');
      }
      //Check for at least 1 argument
      let params = msg.content.replace(/\s+/g, ' ').split(' ');

      if (params[0] !== '/get') {
        return;
      } else if (!params[1]) {
        return bot.reply(msg, 'Wan! You must enter a tag!');
      } else {
        getByTag(bot, msg, params);
      }
    }
  });
};

function getByTag(bot, msg, params) {
  params.shift();
  params = params.join(' ');
  params = params.split(',');
  params.forEach((param, index) => {
    param = param.replace(/\s+/g, ' ').trim();
    param = param.replace(/ /g, '_');
    param = encodeURIComponent(param);
    params[index] = param;
  });
  let formattedTag = params.join(', ');
  let searchTag = params.join('+');

  imageService.getByTagName(searchTag, formattedTag)
    .spread((result, src, tag, tagf) => {
      console.info(result, src, tag);
      if (result && src && tag) {
        let tagMsg = 'Result for **' + decodeURIComponent(tagf) + '**';
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

module.exports = get;
