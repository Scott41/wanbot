'use strict';

const http = require('http');
const url = require('../constants/appConstants').mdbUrl;

let mdbService = () => {
  return {
    getRandomVideo(cb) {
      http.get(url, response => {
          let body = '';
          response.on('data', d => {
            body += d;
          });
          response.on('end', () => {
              let results;
              try {
                results = JSON.parse(body);
              } catch (err) {
                console.error(err);
                return cb({}, err);
              }
              cb(results);
            })
            .on('error', e => {
              console.error(e);
              cb({}, e);
            });
        })
        .on('error', e => {
          console.error(e);
          cb({}, e);
        });

    },
    getVideo(queryParams, cb) {
      http.get(url + '?' + queryParams, response => {
          let body = '';
          response.on('data', d => {
            body += d;
          });
          response.on('end', () => {
              let results;
              try {
                results = JSON.parse(body);
              } catch (err) {
                console.error(err);
                return cb('Oops. Something went wrong with that request..', err);
              }
              // console.log(results);
              cb(results);
            })
            .on('error', e => {
              console.error(e);
              cb({}, e);
            });
        })
        .on('error', e => {
          console.error(e);
          cb({}, e);
        });
    }
  };
};

module.exports = mdbService;
