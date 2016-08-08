'use strict';

const moment = require('moment');

let hosts = [];
const wbtestchan = '113458312455999488';
const meltybloodserver = '84627074005884928';
const wanBotID = '113455053200715776';
const timeout = '20';

let hostManager = bot => {
  bot.on('message', msg => {
    if (msg.author.id === wanBotID) {
      return;
    }

    refreshHostsClock();
    checkForNewHost(msg);

    if (msg.content === '/hosts') {
      let currentHosts = getHosts();
      let response = '';
      const defaultResponse = 'No one has posted an IP in the past ' + timeout + ' minutes. Wan!';

      currentHosts.forEach(host => {

        let timestamp = moment(host.timestamp);

        let hostString = '[**' + timestamp.fromNow() + '** in ' + host.channelName + '] **' +
          host.username + '** --> ' + host.content;

        response += hostString + '\n';

      });

      response = response === '' ? defaultResponse : response;

      bot.sendMessage(msg.channel, response);
    }

  });
};

function checkForNewHost(msg) {
  const hostPattern =
    /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?):[0-9]{1,5}/g;
  let server = msg.channel.server.id;
  if (hostPattern.test(msg.content) &&
    (server === wbtestchan || server === meltybloodserver)) {

    let content = msg.content;
    let currentHosts = getHosts();

    if (content.length && content.length > 80) {
      content = msg.content.match(hostPattern);
    }

    if (currentHosts.length >= 15) {
      deleteHost(0);
    }

    currentHosts.push({
      timestamp: msg.timestamp,
      channelName: msg.channel.name,
      username: msg.author.username,
      userID: msg.author.id,
      content: content
    });

  }
}

function checkForOldHosts() {
  getHosts().forEach( (host, index) => {
    if (moment(host.timestamp) < moment().subtract(parseInt(timeout), 'minutes')) {
      deleteHost(index);
    }
  });
}

function deleteHost(index) {
  let currentHosts = getHosts();
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
