'use strict';

let imageService = require('../services/image.service')();
const errors = require('../constants/appConstants').errors;
const mbServer = require('../constants/appConstants').mbServer;

let get = bot => {
  bot.on('message', msg => {

    if (msg.content.indexOf('/get') === 0 || msg.content.indexOf('/gel') === 0) {
      if (msg.channel.guild.id === mbServer && msg.channel.id !== '85002042438848512') {
        return msg.channel.sendMessage('Wan! This command can only be used in the #spam-nsfw channel.');
      }
      //Check for at least 1 argument
      let params = msg.content.replace(/\s+/g, ' ').split(' ');
      /**
       * '/safe tag name OR tag_name (searches safebooru.org)',
        '/safe a, list, of_tags (multiple tags)',
        '/gel tag name OR tag_name (searches gelbooru.com)',
        '/gel a, list, of_tags (multiple tags)',
       */
      if (params[0] !== '/get' && params[0] !== '/gel') {
        return;
      } else if (!params[1]) {
        return msg.channel.sendMessage(`\`\`\`\nPulls an image from gelbooru.com\nUsage:\n  /gel tag name OR tag_name\n  /gel a, list, of_tags\n\`\`\``);
      } else {
        getByTag(bot, msg, params);
      }
    } else if (msg.content.indexOf('/safe') === 0) {
      if (msg.channel.guild.id === mbServer && msg.channel.id !== '187846760251654144' && msg.channel.id !== '85002042438848512') {
        return msg.channel.sendMessage('Wan! This command can only be used in the #sfw-spam or $nsfw-spam channels.');
      }
      //Check for at least 1 argument
      let params = msg.content.replace(/\s+/g, ' ').split(' ');

      if (params[0] !== '/safe') {
        return;
      } else if (!params[1]) {
        return msg.channel
          .sendMessage(`\`\`\`\nPulls an image from safebooru.org\nUsage:\n  /safe tag name OR tag_name\n  /safe a, list, of_tags\n\`\`\``);
      } else {
        let safe = true;
        getByTag(bot, msg, params, safe);
      }
    }
  });
};

function getByTag(bot, msg, params, safe) {
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

  imageService.getByTagName(searchTag, formattedTag, safe)
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