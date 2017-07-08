'use strict';

let helpList = [
  'Wan! These are the commands you can give me:',
  '/hosts',
  '/safe',
  '/gel',
  '/audio help',
  '/mdb help'
];

let help = bot => {
  bot.on('message', msg => {

    let helpMessage = helpList.join('\n');

    if (msg.content === '/help') {
      msg.channel.sendMessage(helpMessage);
    }

  });
};

module.exports = help;
