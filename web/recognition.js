'use strict';

const request = require('request');

module.exports = {

    ocr: (path) => new Promise(resolve => {

        request({
            method: 'POST',
            uri: 'http://localhost:8080/ocr',
            json: {"file": path}
        },
            (err, response, body) => resolve(body)
        );
    }),

    feedback: (json) => new Promise(resolve => {

        request({
            method: 'POST',
            uri: 'http://localhost:8080/feedback',
            json: json
        },
            (err, response, body) => resolve(body)
        );
    })
};