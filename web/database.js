'use strict';

const mongodb = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/diploma'


module.exports = {

    addUser: (params) => new Promise( (resolve, reject) => {

        let db;

        mongodb.connect(url)
            .then( DB => {

                db = DB;
                console.log('Connected to db');

                return db.collection('users')
                    .findOne({login: params.login});
            })
            .then( user => {

                if(!user) return db.collection('users')
                    .insertOne({
                        login: params.login,
                        password: params.password,
                        receipts: []
                    });

                else resolve({
                    "code": 403,
                    "error": "alreadyExist"
                })
            })
            .then( result => resolve({
                "userToken": result.insertedId
            }))
            .catch(err => reject(err))
    }),

    login: (params) => new Promise( (resolve, reject) => {

        let db;
        mongodb.connect(url)
            .then( DB => {

                db = DB;
                console.log('Connected to db');

                return db.collection('users')
                    .findOne({
                        login: params.login,
                        password: params.password
                    });
            })
            .then(user => {

                if(user) resolve({
                    "userToken": user._id
                });
                else resolve({
                   "code": 401,
                   "error": "notExist"
                })
            })
            .catch(err => reject(err))
    })
};
