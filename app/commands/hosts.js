'use strict';

const moment = require('moment');
const _ = require('lodash');

let hosts = {};
const timeout = '20';

let hostManager = bot => {
  bot.on('message', msg => {
    if (msg.author.id === bot.user.id) {
      return;
    }

    refreshHostsClock();
    checkForNewHost(msg);

    if (msg.content === '/hosts') {      
      let server = msg.channel.guild.id;
      let currentHosts = getHosts()[server] || [];
      let botRecentlyStarted = moment(bot.readyTimestamp) > moment().subtract(parseInt(timeout), 'minutes');
      let response = '';
      let recentlyStartedMessage = '`Wan! I was recently restarted, so I might be missing some IPs. Gomennasai!`\n';    
      const defaultResponse = 
        `${botRecentlyStarted ? recentlyStartedMessage : ''}No one has posted an IP in the past ${timeout} minutes. Wan!`;

      currentHosts.forEach(host => {

        let timestamp = moment(host.timestamp);
        let hostString =
          `[**${timestamp.fromNow()}** in ${host.channelName}] **${host.username}** --> ${host.content}`;

        response += hostString + '\n';

      });

      response = response === '' ? defaultResponse : response;

      msg.channel.sendMessage(response);
    }

  });
};

function checkForNewHost(msg) {
  const hostPattern =
    /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?):[0-9]{1,5}/g;
  let server = msg.channel.guild.id;

  if (hostPattern.test(msg.content)) {

    let content = msg.content;
    let currentHosts = getHosts();
    currentHosts[server] = currentHosts[server] || [];

    if (content.length && content.length > 80) {
      content = msg.content.match(hostPattern);
    }

    if (currentHosts[server].length >= 15) {
      deleteHost(server, 0);
    }

    currentHosts[server].push({
      timestamp: msg.createdTimestamp,
      channelName: msg.channel.name,
      username: msg.author.username,
      userID: msg.author.id,
      content: content
    });

  }
}

function checkForOldHosts() {
  let hosts = getHosts();
  if (_.isEmpty(hosts)) {
    return;
  }
  for (let server in hosts) {
    hosts[server].forEach((host, index) => {
      if (moment(host.timestamp) < moment().subtract(parseInt(timeout), 'minutes')) {
        deleteHost(server, index);
      }
    });
  }
}

function deleteHost(server, index) {
  let currentHosts = getHosts()[server];
  currentHosts.splice(index, 1);
}

function getHosts() {
  return hosts;
}

function refreshHostsClock() {
  const timer = 1000 * 60; //1 Minute
  setTimeout(() => {
    checkForOldHosts();
    setTimeout(() => {
      refreshHostsClock();
    }, 0);
  }, timer);
}

module.exports = hostManager;