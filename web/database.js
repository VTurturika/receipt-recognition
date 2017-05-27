'use strict';

const mongodb = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const url = 'mongodb://localhost:27017/diploma';
let db;

mongodb.connect(url).then(DB => {
    db = DB;
    console.log('Connected to db');
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

                else resolve({
                        "code": 403,
                        "error": "alreadyExist"
                    });
            })
            .then(result => resolve({
                "userToken": result.insertedId
            }))
            .catch(err => reject(err));
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
                console.log(JSON.stringify(user));
                resolve(receipt);
            })
            .catch(err => reject(err));
    }),

    checkToken: (token) => new Promise((resolve, reject) => {

        if(token && token.length !== 24) resolve(false);

        db.collection('users')
            .findOne({
                '_id': ObjectID(token)
            })
            .then(user => resolve(user !== null))
            .catch(err => reject(err));
    }),

    getReceipts: (params, userToken) => new Promise((resolve, reject) => {

        db.collection('users')
            .findOne({
                '_id': ObjectID(userToken)
            })
            .then(user => {

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

                resolve(user.receipts.filter(receipt =>

                    params['dateFrom'] <= new Date(receipt.date) &&
                    params['dateTo'] >= new Date(receipt.date) &&
                    params['minTotal'] <= receipt.total &&
                    params['maxTotal'] >= receipt.total &&
                    (params['currency'] ? receipt.currency === params['currency']: true) &&
                    (params['category'] ? receipt.commonCategory === params['category']: true)
                ));
            })
            .catch(err => reject(err));
    }),

    syncReceipts: (params, userToken) => new Promise((resolve, reject) => {

        db.collection('users')
            .findOne({
                '_id': ObjectID(userToken)
            })
            .then(user => {

                if(!params || !params.receipts || !Array.isArray(params.receipts)) {

                    resolve({
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
