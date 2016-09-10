'use strict';

let ytdl = require('ytdl-core');
let moment = require('moment');
let parseUrlTimestamp = require('../util/parseUrlTimestamp');

const DEFAULT_VOLUME = 0.25;
const LOUDER_VOLUME = 0.5;
const VOLUME_INCREMENT = 0.05;
const VOLUME_DECREMENT = 0.05; 

let currentlyPlaying = {};

let audio = bot => {

  bot.on('message', msg => {
    if (msg.content == '/audio help') {
      audioHelp(bot, msg);
    } else if (msg.content === '/audio up' || msg.content === '/audio volume up') {
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

function audioHelp(bot, msg) {
  let message = `Here are my audio commands!\n
  /audio [youtube link] [time to start at]
  /audio volume up
  /audio volume down
  /audio volume reset
  /audio volume mute\n
  Remember that these commands will only work if you are in a voice channel! 
  example usage:

  \`/audio https://youtube.com/example\`
  \`/audio https://youtube.com/example?t=1:12:04\`     (audio will start at the timestamp in the url)
  \`/audio https://youtube.com/example 2:15\`     (audio will start at 2 minutes 15 seconds, as supplied by the user)
  \`/audio https://youtube.com/example --loud\`      (audio will start playing at a higher volume than normal)`;
  msg.channel.sendMessage(message);
}

function manageAudio(bot, msg, type) {
  if (!msg.member.voiceChannel) {
    return msg.channel
      .sendMessage(`Wan! ${msg.author}, you must be in a voice channel for that command to work.`);
  }

  let connection = getVoiceConnectionForGuild(bot, msg);

  if (!connection) {
    return msg.channel.sendMessage(`Wan! ${msg.author}, I'm not in a voice channel on this server.`);
  }

  switch (type) {
    case 'down':
      volumeDown(connection);
      break;
    case 'up':
      volumeUp(connection);
      break;
    case 'stop':
      audioStop(connection);
      break;
    case 'reset':
      volumeReset(connection);
      break;
    case 'mute':
      volumeMute(connection);
      break;
  }
}

function stream(bot, msg) {
  if (!msg.member.voiceChannel) {
    return msg.channel
      .sendMessage(`Wan! ${msg.author}, you must be in a voice channel for that command to work.`);
  }
  if (!/(^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$)/.test(msg.content.split(' ')[1])) {
    return msg.channel.sendMessage('Wan! I need a YouTube link to play audio!');
  }

  let url = msg.content.split(' ')[1];
  let stream = ytdl(url, {
    filter: 'audioonly'
  });
  let arg2 = msg.content.split(' ')[2];
  let seek = '0';
  if (arg2 && arg2 !== '--loud') {
    if (isTimeFormatValid(arg2)) {
      seek = arg2;
    } else {
      return msg.channel.sendMessage('Wan! Wrong timestamp format! (hint: hh:mm:ss)');
    }
  } else {
    seek = parseUrlTimestamp(url) || '0';
  }
  let louder = msg.content.indexOf('--loud') > -1;
  let options = {
    //maintain this specific order
    seek,
    volume: louder ? DEFAULT_VOLUME * 2 : DEFAULT_VOLUME
  };

  msg.member.voiceChannel.join()
    .then((connection) => {
      setStreamListeners(bot, msg, connection, stream);
      setConnectionListeners(bot, msg, connection);

      if (seek !== '0') {
        console.log(`[starting] seek: ${seek}`);
        msg.channel.sendMessage('Seeking...');
      }

      handleAudioStream(bot, msg, connection, stream, options);
    })
    .catch(err => {
      console.log(`Error joining voiceChannel: ${err}`);
    });
}

function setStreamListeners(bot, msg, connection, stream) {
  stream.on('error', err => {
    console.error(err);
    try {
      connection.disconnect();
    } catch (e) {
      console.error(e);
    }

    msg.channel.sendMessage('Wan! Error loading audio stream.');
    console.log('[stopped] stream error');
  });
}

function setConnectionListeners(bot, msg, connection) {
  connection.on('error', err => {
    console.log(`Connection error: ${err}`);
    msg.channel.sendMessage('Wan! Error loading audio.');
  });

  connection.on('disconnect', reason => {
    if (reason) {
      console.info(reason);
      msg.channel.sendMessage(`Wan! ${reason}`);
    }
  });
}

function handleAudioStream(bot, msg, connection, stream, options) {
  const dispatcher = connection.playStream(stream, options);
  let server = connection.channel.guild.id;

  dispatcher.on('start', () => {
    setCurrentlyPlaying(server, true);    
    msg.channel.sendMessage('Wan! started playing audio.');
  });

  dispatcher.on('debug', info => {
    console.info(`[Dispatcher log] ${info}\n`);
  });

  dispatcher.on('error', err => {
    console.error(`Error in audio stream: ${err}`);
  });

  dispatcher.on('end', () => {
    setCurrentlyPlaying(server, false);

    setTimeout(() => {
      if (!isCurrentlyPlaying(server)) {        
        connection.disconnect();
        console.log(`Finished playing audio in ${msg.channel.name}`);
      }      
    }, 1000);
  });
}

function isCurrentlyPlaying(server) {
  return currentlyPlaying[server] ? true : false;
}

function setCurrentlyPlaying(server, state) {
  currentlyPlaying[server] = state; 
}

function audioStop(connection) {
  if (connection) {
    connection.disconnect('Wan! Stopped playing audio.');
  }
}

function volumeDown(connection) {
  let dispatcher = connection.player.dispatcher;
  dispatcher.setVolume(dispatcher.volume / 2);
  console.log(`[playing] current volume: ${dispatcher.volume}`);
}

function volumeUp(connection) {
  let dispatcher = connection.player.dispatcher;
  dispatcher.setVolume(dispatcher.volume + VOLUME_INCREMENT);  
  console.log(`[playing] current volume: ${dispatcher.volume}`);
}

function volumeReset(connection) {
  let dispatcher = connection.player.dispatcher;
  dispatcher.setVolume(DEFAULT_VOLUME);  
  console.log(`[playing] current volume: ${dispatcher.volume}`);
}

function volumeMute(connection) {
  let dispatcher = connection.player.dispatcher;
  dispatcher.setVolume(0);  
  console.log(`[playing] current volume: ${dispatcher.volume}`);
}

function getVoiceConnectionForGuild(bot, msg) {
  let connection;
  let connections = bot.voiceConnections.array() || [];
  connections.forEach(c => {
    if (msg.member.guild.id === c.channel.guild.id) {
      return connection = c;
    }
  });

  return connection;
}

function isTimeFormatValid(timestamp) {
  return moment(timestamp, 's', true).isValid() || moment(timestamp, 'ss', true).isValid() ||
    moment(timestamp, 'm:ss', true).isValid() || moment(timestamp, 'mm:ss', true).isValid() ||
    moment(timestamp, 'h:mm:ss', true).isValid() || moment(timestamp, 'hh:mm:ss', true).isValid();
}

module.exports = audio;
