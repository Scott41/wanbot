'use strict';

let imageService = require('../services/image.service')();
const errors = require('../constants/appConstants').errors;
const mbServer = require('../constants/appConstants').mbServer;

let get = bot => {
  bot.on('message', msg => {

    if (msg.content.indexOf('/get') === 0) {

      if (msg.channel.guild.id === mbServer && msg.channel.id !== '85002042438848512') {
        return msg.channel.sendMessage('Wan! This command can only be used in the #spam-nsfw channel.');
      }
      //Check for at least 1 argument
      let params = msg.content.replace(/\s+/g, ' ').split(' ');

      if (params[0] !== '/get') {
        return;
      } else if (!params[1]) {
        return msg.channel.sendMessage(`${msg.author} Wan! You must enter a tag!`);
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
  let searchTag = `${params.join('+')}+-loli+-shota`;

  imageService.getByTagName(searchTag, formattedTag)
    .spread((result, src, tag, tagf) => {
      console.info(result, src, tag);
      if (result && src && tag) {
        let tagMsg = 'Result for **' + decodeURIComponent(tagf) + '**';
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

module.exports = get;
