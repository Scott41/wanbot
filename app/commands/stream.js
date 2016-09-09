'use strict';

let ytdl = require('ytdl-core');
let moment = require('moment');
let parseUrlTimestamp = require('../util/parseUrlTimestamp');
let seeking = false;

const HISUICIDE_PACT = '112794416908861440';
const WTS = '113458312455999488';

const DEFAULT_VOLUME = 0.25;
const LOUDER_VOLUME = 0.5;
const VOLUME_INCREMENT = 0.05;
const VOLUME_DECREMENT = 0.05;

let audio = bot => {
  bot.on('message', msg => {

    if (msg.content === '/audio up' || msg.content === '/audio volume up') {
      manageAudio(bot, msg, 'up');
    } else if (msg.content === '/audio down' || msg.content === '/audio volume down') {
      manageAudio(bot, msg, 'down');
    } else if (msg.content === '/audio stop') {
      manageAudio(bot, msg, 'stop');
    } else if (msg.content === '/audio volume reset') {
      manageAudio(bot, msg, 'reset');
    } else if (msg.content === '/audio mute') {
      manageAudio(bot, msg, 'mute');
    } else if (msg.content.startsWith('/audio')) {
      stream(bot, msg);
    }

  });
};

function stream(bot, msg) {
  if (msg.guild.id !== HISUICIDE_PACT && msg.guild.id !== WTS) {
    return msg.channel.sendMessage('Wan! That command doesn\'t work on the ' + msg.guild.name +
      ' server. Gomennasai!');
  } else if (msg.author.voiceChannel) {
    if (bot.voiceConnection && bot.voiceConnection.voiceChannel !== msg.author.voiceChannel) {
      return msg.channel.sendMessage('Wan! I\'m busy playing audio in another voice channel right now.');
    } else if (!/(^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$)/.test(msg.content.split(' ')[1])) {
      return msg.channel.sendMessage('Wan! I need a YouTube link to play audio!');
    } else if (seeking) {
      return msg.channel.sendMessage('Wan! Currently seeking. use `/audio stop` to stop seeking.');
    }

    let url = msg.content.split(' ')[1];
    let stream = ytdl(url, {
      filter: 'audioonly'
    });
    let arg2 = msg.content.split(' ')[2];
    let seek = '0';
    if (arg2 && arg2 !== '--loud') {
      if (moment(arg2, 's', true).isValid() || moment(arg2, 'ss', true).isValid() ||
          moment(arg2, 'm:ss', true).isValid() || moment(arg2, 'mm:ss', true).isValid() ||
          moment(arg2, 'h:mm:ss', true).isValid() || moment(arg2, 'hh:mm:ss', true).isValid()) {
        seek = arg2;
      } else {
        return msg.channel.sendMessage('Wan! Wrong timestamp format! (hint: hh:mm:ss)');
      }
    } else {
      seek = parseUrlTimestamp(url) || '0';
    }
    let louder = msg.content.indexOf('--loud') > -1;
    let options = {
      volume: louder ? DEFAULT_VOLUME * 2 : DEFAULT_VOLUME,
      seek
    };

    seeking = false;

    bot.joinVoiceChannel(msg.author.voiceChannel)
      .then(() => {
        stream.on('error', err => {
          console.error(err);
          if (bot.voiceConnection) {
            bot.voiceConnection.destroy();
          }
          msg.channel.sendMessage('Wan! Error loading audio.');
          console.log('[stopped] stream error');
        });

        if(seek !== '0') {
          seeking = true;
          console.log('[starting] seek: ' + seek);
          msg.channel.sendMessage('Seeking...');
        }
        handleAudioStream(bot, msg, stream, options);
      });

  } else {
    msg.channel.sendMessage('Wan! ' + msg.author + ', you must be in a voice channel for that command to work.');
  }
}

function manageAudio(bot, msg, type) {
  if (msg.guild.id !== HISUICIDE_PACT && msg.guild.id !== WTS) {
    return msg.channel.sendMessage('Wan! That command doesn\'t work on the ' + msg.guild.name +
      ' server. Gomennasai!');
  } else if (msg.author.voiceChannel && bot.voiceConnection && bot.voiceConnection.voiceChannel &&
    bot.voiceConnection.voiceChannel !== msg.author.voiceChannel) {
    msg.channel.sendMessage('Wan! ' + msg.author +
      ', you must be in **my** voice channel for that command to work.');
  } else if (!msg.author.voiceChannel) {
    msg.channel.sendMessage('Wan! ' + msg.author + ', you must be in a voice channel for that command to work.');
  } else if (!bot.voiceConnection) {
    msg.channel.sendMessage('Wan! ' + msg.author + ', I\'m not currently in a voice channel.');
  } else {
    switch (type) {
      case 'down':
        volumeDown(bot, msg);
        break;
      case 'up':
        volumeUp(bot, msg);
        break;
      case 'stop':
        audioStop(bot, msg);
        break;
      case 'reset':
        volumeReset(bot, msg);
        break;
      case 'mute':
        volumeMute(bot, msg);
        break;
    }
  }
}

function handleAudioStream(bot, msg, stream, options) {
  bot.voiceConnection.playRawStream(stream, options)
    .then(intent => {

      try {
        bot.voiceConnection.streamProc.stdin.on('error', err => {
          console.error(err);
        });
      } catch (e) {
        return console.error(e);
      }

      intent.on('error', err => {
        console.error(err);
        if (bot.voiceConnection) {
          bot.voiceConnection.destroy();
          console.log('[stopped] audio error');
        }
      });

      intent.on('end', () => {
        if (bot.voiceConnection) {
          setTimeout(() => {
            if (bot.voiceConnection && !bot.voiceConnection.playingIntent && !seeking) {
              bot.voiceConnection.destroy();
              console.log('[stopped] audio ended');
            }
          }, 1000);

        }
      });

      console.log('[playing] started playing. Volume: ' + bot.voiceConnection.getVolume());
      seeking = false;
      msg.channel.sendMessage('Wan! Started playing audio.');
    })
    .catch(err => {
      console.error(err);
    });
}

function audioStop(bot, msg) {
  bot.voiceConnection.destroy();
  seeking = false;
  msg.channel.sendMessage('Wan! Stopped playing audio.');
}

function volumeDown(bot, msg) {
  bot.voiceConnection.setVolume(bot.voiceConnection.getVolume() / 2);
  console.log('[playing] current volume: ' + bot.voiceConnection.getVolume());
}

function volumeUp(bot, msg) {
  bot.voiceConnection.setVolume(bot.voiceConnection.getVolume() + VOLUME_INCREMENT);
  console.log('[playing] current volume: ' + bot.voiceConnection.getVolume());
}

function volumeReset(bot, msg) {
  try {
    bot.voiceConnection.setVolume(DEFAULT_VOLUME);
    console.log('[playing] current volume: ' + bot.voiceConnection.getVolume());
  } catch (e) {
    console.error(e);
  }
}

function volumeMute(bot, msg) {
  bot.voiceConnection.setVolume(0);
  console.log('[playing] current volume: ' + bot.voiceConnection.getVolume());
}

module.exports = audio;
