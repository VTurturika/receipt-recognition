'use strict';

const mongodb = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const url = 'mongodb://localhost:27017/diploma';

module.exports = {

    addUser: (params) => new Promise( (resolve, reject) => {

        let db;
        let userToken;
        mongodb.connect(url)
            .then(DB => {

                db = DB;
                console.log('Connected to db');

                return db.collection('users')
                    .findOne({login: params.login});
            })
            .then(user => {

                if(!user) return db.collection('users')
                    .insertOne({
                        login: params.login,
                        password: params.password,
                        receipts: []
                    });

                else db.close().then(() => resolve({
                        "code": 403,
                        "error": "alreadyExist"
                    }));
            })
            .then(result => {
                userToken = result.insertedId;
                return db.close();
            })
            .then(() => resolve({
                "userToken": userToken
            }))
            .catch(err => reject(err))
    }),

    login: (params) => new Promise( (resolve, reject) => {

        let db;
        let userToken;
        mongodb.connect(url)
            .then(DB => {

                db = DB;
                console.log('Connected to db');

                return db.collection('users')
                    .findOne({
                        login: params.login,
                        password: params.password
                    });
            })
            .then(user => {

                if(user) {
                    userToken = user._id;
                    return db.close();
                }
                else db.close().then(() => resolve({
                   "code": 401,
                   "error": "notExist"
                }));
            })
            .then(() => resolve({
                "userToken": userToken
            }))
            .catch(err => reject(err))
    }),

    saveReceipt: (receipt, userToken) => new Promise((resolve, reject) => {

        let db;
        mongodb.connect(url)
            .then(DB => {

                db = DB;
                console.log('Connected to db');

                receipt.feedbackToken = ObjectID();
                return db.collection('users')
                    .findOneAndUpdate({
                        '_id': ObjectID(userToken)
                    }, {
                        $push: {receipts: receipt}
                    });
            })
            .then(user => {

                console.log(user);
                resolve(receipt);
            })
            .catch(err => reject(err))
    }),

    getReceipts: (params, userToken) => new Promise((resolve, reject) => {

        let db;
        mongodb.connect(url)
            .then(DB => {

                db = DB;
                console.log('Connected to db');

                return db.collection('users')
                    .findOne({
                        '_id': ObjectID(userToken)
                    });
            })
            .then(user => {

                console.log(user);
                resolve(user.receipts);
            })
            .catch(err => reject(err))
    })
};
