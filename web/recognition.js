'use strict';

const request = require('request');
const formidable = require('formidable');
const fs = require('fs');

module.exports = {

    hasToken: (req) => new Promise((resolve,reject) => {

        if(!req.query['userToken']) {
            reject({
                code: 400,
                error: 'badRequest',
                case: 'user token is required'
            })
        }
        else resolve(true)
    }),

    hasItems: (req) => new Promise((resolve,reject) => {

        if(req.body.items && Array.isArray(req.body.items) && req.body.items.length > 0) {
            resolve(true)
        }
        else reject({
            code: 400,
            error: 'badRequest',
            case: 'items are required'
        })
    }),

    receivePhoto: (req) => new Promise((resolve, reject) => {

        console.log('receivePhoto start');
        let form = formidable.IncomingForm({uploadDir: './uploads'});

        form.parse(req, (err, fields, files) => {

                if(err) {

                    console.log(err.message);
                    return reject({
                        code: 500,
                        error: 'serverError',
                        case: 'receipt not received',
                        message: err.message
                    });
                }

                if (!files.receipt || !files.receipt.path) {

                    console.log('badRequest - receipt field not exist');
                    return reject({
                        code: 400,
                        error: 'badRequest',
                        case: 'receipt field not exist'
                    });
                }

                let path = __dirname + '/' + files.receipt.path;
                if(fs.existsSync(path)) {
                    resolve(path);
                }
                else {
                    console.log('serverError - receipt received but not saved');
                    return reject({
                        code: 500,
                        error: 'serverError',
                        case: 'receipt received but not saved'
                    });
                }
            });

    }),

    ocr: (params) => new Promise((resolve,reject) => {

        let json = {
            needOcr: !!(params && params.path),
            file: params && params.path ? params.path : null,
            items: params && params.items ? params.items: null
        };

        console.log('ocr request send');
        request({
            method: 'POST',
            uri: 'http://localhost:8080/ocr',
            json: json
        },
            (err, response, body) => {

                if(err) {
                    console.log(err.message);
                    reject({
                        code: 500,
                        error: 'serverError',
                        case: 'ocr request failed',
                        message: err.message
                    })
                }
                else {
                    console.log('ocr request successful');
                    resolve(body);
                }
            }
        );
    }),

    feedback: (json) => new Promise((resolve,reject) => {

        console.log('feedback request send');
        request({
            method: 'POST',
            uri: 'http://localhost:8080/feedback',
            json: json
        },
            (err, response, body) => {
                if(err) {
                    console.log(err.message);
                    reject({
                        code: 500,
                        error: 'serverError',
                        case: 'feedback request failed',
                        message: err.message
                    })
                }
                else {
                    console.log('feedback request successful');
                    resolve(body);
                }
            }
        );
    }),

    hasLoginAndPassword: (req) => new Promise((resolve,reject) => {

        if(!req.body.login || !req.body.password) {

            reject({
                "code": 400,
                "error": "badRequest"
            });
        }
        else resolve(true);
    })
};