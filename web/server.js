'use strict';

const express = require('express');
const app = express();
const request = require('request');
const bodyParser = require('body-parser');
const formidable = require('formidable');
const fs = require('fs');
const cors = require('cors');
const db = require('./database');
const recognition = require('./recognition');

const port = process.env.PORT || 80;

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
  res.end('receipt recognition backend worked')
});

app.post('/api/receipt/ocr', (req, res) => {

    //todo add check if userToken exists in db
    if( !req.query['userToken'] ) {
        res.status(400);
        return res.json({
            code: 400,
            error: 'badRequest',
            case: 'user token is required'
        })
    }

    db.checkToken(req.query['userToken'])
        .then(isExist => {

            if(!isExist) {
                res.status(400);
                return res.json({
                    code: 400,
                    error: 'badRequest',
                    case: 'wrong user token'
                });
            }

            //todo change image receiving
            let form = formidable.IncomingForm({uploadDir: './uploads'});

            form.parse(req, (err, fields, files) => {

                console.log(err);
                console.log(fields);
                console.log(files);

                if (!files.receipt || !files.receipt.path) {
                    res.status(400);
                    return res.json({
                        code: 400,
                        error: 'badRequest',
                        case: 'receipt field'
                    });
                }

                let path = __dirname + '/' + files.receipt.path;
                console.log(fs.existsSync(path));
                console.log(path);

                recognition.ocr(path)
                    .then(receipt => db.saveReceipt(receipt, req.query['userToken']))
                    .then(receipt => res.json(receipt))
                    .catch(err => res.json(err));
            });

        });
});

app.post('/api/receipt/feedback', (req, res) => {

    if( !req.query['userToken'] ) {
        res.status(400);
        return res.json({
            code: 400,
            error: 'badRequest',
            case: 'user token is required'
        })
    }

    db.checkToken(req.query['userToken'])
        .then(isExist => {

            if(!isExist) {
                res.status(400);
                res.json({
                    code: 400,
                    error: 'badRequest',
                    case: 'wrong user token'
                });
            }
            else recognition.feedback(req.body).then(body => res.json(body))
        });
});

app.post('/api/user/new', (req, res) => {

    console.log('POST /api/user/new');
    console.log('\tbody: ', req.body);

    if(!req.body.login || !req.body.password) {
        res.status(400);
        return res.json({
            "code": 400,
            "error": "badRequest"
        });
    }

    db.addUser(req.body)
        .then(result => {
            res.status( result.code ? result.code : 200);
            res.json(result);
        })
        .catch(err => res.json(err));
});


app.post('/api/user/login', (req, res) => {

    console.log('POST /api/user/login');
    console.log('\tbody: ', req.body);

    if(!req.body.login || !req.body.password) {
        res.status(400);
        return res.json({
            "code": 400,
            "error": "badRequest"
        });
    }

    db.login(req.body)
        .then(result => {
            res.status( result.code ? result.code : 200);
            res.json(result);
        })
        .catch(err => res.json(err));
});

app.get('/api/user/list', (req, res) => {

    console.log('GET /api/user/list');

    if( !req.query['userToken'] ) {
        res.status(400);
        return res.json({
            code: 400,
            error: 'badRequest',
            case: 'user token'
        });
    }

    db.checkToken(req.query['userToken'])
        .then(isExist => {

            if (!isExist) {
                res.status(400);
                res.json({
                    code: 400,
                    error: 'badRequest',
                    case: 'wrong user token'
                });
            }
            else db.getReceipts({}, req.query['userToken'])
                .then(receipts => res.json({receipts: receipts}))
                .catch(err => res.json(err));
        });

});

app.post('/api/user/sync', (req, res) => {

    console.log('POST /api/user/sync');
    res.json({
        "receipts": [
            {
                "date": "2017-04-23",
                "time": "15:30",
                "total": 123.50,
                "currency": "UAH",
                "commonCategory": "food",
                "items":[
                    {
                        "number": 1,
                        "name": "Яблуко Зелене",
                        "price": 12.30,
                        "category": "food",
                        "measure": "кг",
                        "value": 0.73,
                    },{
                        "number": 2,
                        "name": "Яблуко Червоне",
                        "price": 15.30,
                        "category": "food",
                        "measure": "кг",
                        "value": 0.5,
                    },{
                        "number": 3,
                        "name": "Батарейки",
                        "price": 5.40,
                        "category": "electronics",
                        "measure": "шт",
                        "value": 2,
                    }
                ]
            }
        ]
    });
});


app.listen(port,  () => console.log(`Server listening on port ${port}!`) );
