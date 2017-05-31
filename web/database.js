'use strict';

const mongodb = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const url = 'mongodb://localhost:27017/diploma';
let db;

mongodb.connect(url)
    .then(DB => {
        db = DB;
        console.log('Connected to db');
    })
    .catch(err => {
        console.log(err.message);
        process.exit(1);
    });

module.exports = {

    addUser: (params) => new Promise((resolve, reject) => {

        db.collection('users')
            .findOne({
                login: params.login
            })
            .then(user => {

                if(!user) return db.collection('users')
                    .insertOne({
                        login: params.login,
                        password: params.password,
                        receipts: []
                    });

                else reject({
                        "code": 403,
                        "error": "alreadyExist"
                    });
            })
            .then(result => resolve({
                "userToken": result.insertedId
            }))
            .catch(err => reject({
                code: 500,
                err: 'serverError',
                case: 'db error',
                message: err.message
            }));
    }),

    login: (params) => new Promise((resolve, reject) => {

        db.collection('users')
            .findOne({
                login: params.login,
                password: params.password
            })
            .then(user => {

                if(user) resolve({
                    "userToken": user._id
                });

                else resolve({
                   "code": 401,
                   "error": "notExist"
                });
            })
            .catch(err => reject(err));
    }),

    saveReceipt: (receipt, userToken) => new Promise((resolve, reject) => {

        receipt.feedbackToken = ObjectID();

        db.collection('users')
            .findOneAndUpdate({
                '_id': ObjectID(userToken)
            }, {
                $push: {receipts: receipt}
            })
            .then(user => {

                if(!user)
                    reject({
                        code: 401,
                        err: 'unauthorized',
                        case: 'user not found'
                    });
                console.log(JSON.stringify(user));
                resolve(receipt);
            })
            .catch(err => reject({
                code: 500,
                err: 'serverError',
                case: 'db error',
                message: err.message
            }));
    }),

    checkToken: (token) => new Promise((resolve, reject) => {

        if(!ObjectID.isValid(token)) {
            console.log('invalid token');
            return reject({
                code: 400,
                err: 'badRequest',
                case: 'invalid token'
            });
        }

        db.collection('users')
            .findOne({
                '_id': ObjectID(token)
            })
            .then(user => {
                if(user)
                    resolve(true);
                else {
                    console.log('user not found');
                    reject({
                        code: 401,
                        err: 'unauthorized',
                        case: 'user not found'
                    })
                }
            })
            .catch(err => {
                reject({
                    code: 500,
                    err: 'serverError',
                    case: 'db error',
                    message: err.message
                })
            });
    }),

    getReceipts: (params, userToken) => new Promise((resolve, reject) => {

        db.collection('users')
            .findOne({
                '_id': ObjectID(userToken)
            })
            .then(user => {

                if(!user) {
                    return reject({
                        code: 401,
                        err: 'unauthorized',
                        case: 'user not found'
                    })
                }

                try {
                    params['dateFrom'] = params['dateFrom']
                        ? new Date(params['dateFrom'])
                        : new Date('1900-01-01');
                    params['dateTo'] = params['dateTo']
                        ? new Date(params['dateTo'])
                        : new Date('2100-01-01');
                    params['minTotal'] = params['minTotal']
                        ? Number.parseFloat(params['minTotal'])
                        : -Infinity;
                    params['maxTotal'] = params['maxTotal']
                        ? Number.parseFloat(params['maxTotal'])
                        : Infinity;
                }
                catch (err) {
                    return reject({
                        code: 400,
                        err: 'badRequest',
                        case: 'invalid params',
                        message: err.message
                    })
                }

                resolve(user.receipts.filter(receipt =>

                    params['dateFrom'] <= new Date(receipt.date) &&
                    params['dateTo'] >= new Date(receipt.date) &&
                    params['minTotal'] <= receipt.total &&
                    params['maxTotal'] >= receipt.total &&
                    (params['currency'] ? receipt.currency === params['currency']: true) &&
                    (params['category'] ? receipt.commonCategory === params['category']: true)
                ));
            })
            .catch(err => {
                reject({
                    code: 500,
                    err: 'serverError',
                    case: 'db error',
                    message: err.message
                })
            });
    }),

    syncReceipts: (params, userToken) => new Promise((resolve, reject) => {

        db.collection('users')
            .findOne({
                '_id': ObjectID(userToken)
            })
            .then(user => {

                if(!params || !params.receipts || !Array.isArray(params.receipts)) {

                    return reject({
                        code: 400,
                        error: 'badRequest',
                        case: 'receipts field are required'
                    });
                }

                let dbReceipts = {};
                let userReceipts = {};
                user.receipts.forEach(receipt => dbReceipts[receipt.feedbackToken] = receipt);
                params.receipts.forEach(receipt => userReceipts[receipt.feedbackToken] = receipt);

                let addToDb = [];
                Object.keys(userReceipts).forEach(token => {

                    if(!dbReceipts[token]) {
                        let receipt = userReceipts[token]['feedbackToken'];
                        receipt['feedbackToken'] = ObjectID(receipt['feedbackToken']);
                        addToDb.push(receipt);
                    }
                });

                let sendToUser = [];
                Object.keys(dbReceipts).forEach(token => {

                    if(!userReceipts[token]) sendToUser.push(dbReceipts[token]);
                });

                if(addToDb.length > 0) {
                    db.collection('users')
                        .findOneAndUpdate({
                            '_id': ObjectID(userToken)
                        }, {
                        $push: {receipts: {$each: addToDb}}
                    })
                    .then(() => {

                        resolve({
                        receipts:  sendToUser.length > 0
                            ? params.receipts.concat(sendToUser)
                            : params.receipts
                        })
                    })
                }
                else {

                    resolve({
                        receipts:  sendToUser.length > 0
                            ? params.receipts.concat(sendToUser)
                            : params.receipts
                    })
                }
            })
            .catch(err => reject(err));
    })
};
