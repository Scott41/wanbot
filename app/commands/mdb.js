'use strict';

let mdbService = require('../services/mdb.service.js')();
let appConstants = require('../constants/appConstants');
let parseUrlTimestamp = require('../util/parseUrlTimestamp');
let charList = require('../data/charnames').charList;
let aliasCollection = require('../data/charnames').aliasCollection;

module.exports = bot => {
  bot.on('message', msg => {
    if (msg.content.toLowerCase() === '/mdb help') {
      help(bot, msg);
    } else if (msg.content.toLowerCase() === '/mdb' || msg.content.toLowerCase() === '/meltydb') {
      randomVideo(bot, msg);
    } else if (msg.content.toLowerCase().indexOf('/mdb') === 0 ||
               msg.content.toLowerCase().indexOf('/meltydb') === 0 &&
               msg.content.split(' ').length > 1) {
      video(bot, msg);
    }
  });
};

function help(bot, msg) {
  let list = `Valid character names (**not case-sensitive**): ${charList.join(', ')}`;
  let helpMessage = 'Commands (**not case sensitive**):\n/mdb\n/mdb character\n/mdb' +
    ' moon-character\n/mdb moon-character, moon-character';
  let exampleMessage = 'Examples:\n/mdb aoko (picks a random moon)\n/mdb h-white len\n/mdb c-nero, f-kohamech';

  return msg.channel.sendMessage(`${helpMessage}\n\n${exampleMessage}\n\n${list}`);
}

function randomVideo(bot, msg) {
  // No args, random video
  mdbService.getRandomVideo((results, err) => {
    if (err) {
      msg.channel.sendMessage(appConstants.errors.oops);
      return console.error(err);
    } else if (!results || typeof results.length === 'undefined') {
      return msg.channel.sendMessage(appConstants.errors.oops);
    } else if (results.length < 1) {
      return msg.channel.sendMessage(appConstants.errors.noResults);
    }

    let index = randomNum(results.length);
    let result = results[index];

    if (!result.link) {
      return msg.channel.sendMessage(appConstants.errors.oops);
    }

    let vs = vsStringBuilder(result);
    let time = `Match starts at **${parseUrlTimestamp(result.link)}**`;

    msg.channel.sendMessage(result.link)
      .then(() => {
        msg.channel.sendMessage(time);
      })
      .then(() => {
        msg.channel.sendMessage(vs);
      });
    });
}

function video(bot, msg) {
  // At least 1 arg

  // Remove command from content
  let params = msg.content.split(' ');
  params.shift();
  params = params.join(' ');
  params = params.replace(/\s+/g, ' ').trim();

  let queryParams = '';
  let c1, c2, m1, m2;

  if (params.indexOf(',') > -1) {
    // Has 2 args
    console.log(params);
    params = params.split(',');
    let param1 = params[0].trim();
    let param2 = params[1].trim();
    let hasM1 = param1.split('-').length > 1;
    let hasM2 = param2.split('-').length > 1;

    m1 = hasM1 ? convertToLongMoon(param1.split('-')[0]) : undefined;
    c1 = hasM1 ? convertCharName(param1.split('-')[1]) : convertCharName(param1);
    m2 = hasM2 ? convertToLongMoon(param2.split('-')[0]) : undefined;
    c2 = hasM2 ? convertCharName(param2.split('-')[1]) : convertCharName(param2);

    console.log(m1, m2);

    if ((hasM1 && hasM2 && (!m1 || !m2 || !c1 || !c2)) ||
        (hasM1 && (!m1 || !c1 || !c2)) ||
        (hasM2 && (!m2 || !c1 || !c2))) {
      console.log(m1, c1, m2, c2);
      return msg.channel.sendMessage(appConstants.errors.wrongFormat);
    }

    let m1Param = hasM1 ? '&m1=' + m1 : '';
    let m2Param = hasM2 ? '&m2=' + m2 : '';

    queryParams = 'c1=' + c1 + m1Param + '&c2=' + c2 + m2Param;
  } else {
    // Has 1 arg
    if (params.indexOf('-') > -1) {
      // Has moon
      m1 = convertToLongMoon(params.split('-')[0]);
      c1 = convertCharName(params.split('-')[1].trim());

      if (!m1 || !c1) {
        return msg.channel.sendMessage(appConstants.errors.wrongFormat);
      }

      queryParams = 'c1=' + c1 + '&m1=' + m1;
    } else {
      // No moon in param
      c1 = convertCharName(params.trim());

      if (!c1) {
        return msg.channel.sendMessage(appConstants.errors.wrongFormat);
      }

      queryParams = 'c1=' + c1;
    }

  } //http://www.meltydb.com/api.php?c1=Aoko&m1=crescent&c2=CHARACTER2&m2=MOON2

  if (c1 && c2) {
    let c1IsValid = isCharNameValid(c1);
    let c2IsValid = isCharNameValid(c2);

    if(!c1IsValid || !c2IsValid) {
      let pluralize = !c1IsValid && !c2IsValid ? 's' : '';
      let nameDelimeter = !c1IsValid && !c2IsValid ? ', ': '';
      let responseName1 = c1IsValid ? '' : '**' + c1 + '**';
      let responseName2 = c2IsValid ? '' : '**' + c2 + '**';
      let response = 'Wan! Invalid character name' + pluralize + ': ' + responseName1 + nameDelimeter +
        responseName2 + '. For a list of character names, use the `/mdb help` command.';
      return msg.channel.sendMessage(response);
    } else {
      return handleVideoRetrieval(bot, msg, queryParams);
    }
  } else if (c1) {
    let c1IsValid = isCharNameValid(c1);

    if(!c1IsValid) {
      let response = 'Wan! Invalid character name: **' + c1 +
        '**. For a list of character names, use the `/mdb help` command.';
      return msg.channel.sendMessage(response);
    } else {
      return handleVideoRetrieval(bot, msg, queryParams);
    }
  }

}

function convertCharName(name) {
  let n;

  if (name) {
    n = name.toLowerCase().trim();
  }

  n = checkAliases(n);

  switch (n) {
    case 'mech hisui':
      return 'mech-hisui';
    default:
      return n;
  }
}

function checkAliases(n) {
  aliasCollection.forEach(aliasObj => {
    aliasObj.aliases.forEach(alias => {
      if (n === alias) {
        return n = aliasObj.char.toLowerCase().trim();
      }
    });
  });

  return n;
}

function convertToShortMoon(m) {
  let moon = m.toLowerCase();
  switch (moon) {
    case 'crescent':
      return 'C';
    case 'half':
      return 'H';
    case 'full':
      return 'F';
    default:
      return '?';
  }
}

function convertToLongMoon(m) {
  let moon = m.toLowerCase().trim();
  let c = 'crescent',
    h = 'half',
    f = 'full',
    any = [c, h, f];
  switch (moon) {
    case 'c':
    case 'crescent':
      return c;
    case 'h':
    case 'half':
      return h;
    case 'f':
    case 'full':
      return f;
    case 'random':
      let r = Math.floor(Math.random() * 3);
      return any[r];
    default:
      return false;
  }
}

function handleVideoRetrieval(bot, msg, queryParams) {
  mdbService.getVideo(queryParams, (results, err) => {
    if (err) {
      msg.channel.sendMessage(appConstants.errors.oops);
      return console.error(err);
    } else if (!results || typeof results.length === 'undefined') {
      return msg.channel.sendMessage(appConstants.errors.oops);
    } else if (results.length < 1) {
      return msg.channel.sendMessage(appConstants.errors.noResults);
    }

    let index = randomNum(results.length);
    let result = results[index];

    if (!result.link) {
      return msg.channel.sendMessage(appConstants.errors.oops);
    }

    let vs = vsStringBuilder(result);
    let time = 'Match starts at **' + parseUrlTimestamp(result.link) + '**';

    msg.channel.sendMessage(result.link).then(() => {
      msg.channel.sendMessage(time);
    }).then(() => {
      msg.channel.sendMessage(vs);
    });
  });
}

function isCharNameValid(name) {
  let isValid = false;

  charList.forEach(char => {
    if (name.toLowerCase() === char.toLowerCase()) {
      return isValid = true;
    }
  });

  return isValid;
};

function randomNum(length) {
  return Math.floor(Math.random() * length);
}

function vsStringBuilder(mdbObj) {
  let char1moon = convertToShortMoon(mdbObj.moon1);
  let char2moon = convertToShortMoon(mdbObj.moon2);
  let builtString = char1moon + '-' + mdbObj.character1 + ' (' + mdbObj.player1 + ') vs. ' +
    char2moon + '-' + mdbObj.character2 + ' (' + mdbObj.player2 + ')';

  return builtString;
}
