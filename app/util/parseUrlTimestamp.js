'use strict';

function parseUrlTimestamp(url) {
  if (url && url.indexOf('t=') === -1) {
    return 0;
  }
  let timeParam = url.split('t=')[1];

  // Timestamp in seconds
  if (!/[a-zA-Z]/.test(timeParam)) {
    return timeParam;
  }

  let mExists = timeParam.indexOf('m') > -1;
  let sExists = timeParam.indexOf('s') > -1;
  let hExists = timeParam.indexOf('h') > -1;
  let h, m, s;
  if (hExists && mExists && sExists) {
    // 00h00m00s
    h = timeParam.split('h')[0];
    m = timeParam.split('h')[1].split('m')[0];
    s = timeParam.split('m')[1].split('s')[0];
    m = m.length > 1 ? m : '0' + m;
    s = s.length > 1 ? s : '0' + s;
    return h + ':' + m + ':' + s;
  } else if (hExists && mExists) {
    // 00h00m
    h = timeParam.split('h')[0];
    m = timeParam.split('h')[1].split('m')[0];
    m = m.length > 1 ? m : '0' + m;
    return h + ':' + m + ':00';
  } else if (hExists && sExists) {
    // 00h00s
    h = timeParam.split('h')[0];
    s = timeParam.split('h')[1].split('s')[0];
    s = s.length > 1 ? s : '0' + s;
    return h + ':00:' + s;
  } else if (mExists && sExists) {
    // 00m00s
    m = timeParam.split('m')[0];
    s = timeParam.split('m')[1].split('s')[0];
    s = s.length > 1 ? s : '0' + s;
    return m + ':' + s;
  } else if (hExists) {
    // 00h
    h = timeParam.split('h')[0];
    return h + ':00:00';
  } else if (mExists) {
    // 00m
    m = timeParam.split('m')[0];
    return m + ':00';
  } else if (sExists) {
    // 00s
    s = timeParam.split('s')[0];
    s = s.length > 1 ? s : '0' + s;
    return '0:' + s;
  } else {
    return 0;
  }
};

module.exports = parseUrlTimestamp;
