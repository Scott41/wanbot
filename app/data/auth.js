'use strict';

let auth = {};

(() => {
  if (process.env.WANBOT_MODE === 'TEST') {
    auth.token = process.env.WANBOT_TOKEN_TEST || '';
    auth.mode = 'TEST';
  } else {
    auth.token = process.env.WANBOT_TOKEN || '';
    auth.mode = 'PROD';
  }
})();


module.exports = auth;
