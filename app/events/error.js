'use strict';

let errorEvent = bot => {
  bot.on('error', (err, packet) => {
    console.error('*************** ERROR ******************');
    if (err) {
      console.error('Error: ' + err);
    }
    if (packet) {
      console.error('Packet: ' + packet);
    }
  });
};

module.exports = errorEvent;
