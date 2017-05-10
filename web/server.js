'use strict';

const express = require('express');
const app = express();
const request = require('request');
const bodyParser = require('body-parser');
const formidable = require('formidable');
const fs = require('fs');
const cors = require('cors')
const db = require('./database')

const port = process.env.PORT || 80;

app.use(bodyParser.json());
app.use(cors())

app.get('/', (req, res) => {
  res.end('receipt recognation fake backend')
});

app.post('/api/receipt/ocr', (req, res) => {

    let form = formidable.IncomingForm({uploadDir: './uploads'});

    if( !req.param('userToken') ) {
        res.status(400);
        return res.json({
            code: 400,
            error: 'badRequest',
            case: 'user token'
        })
    }

    form.parse(req, (err, fields, files) => {

        console.log(err);
        console.log(fields);
        console.log(files);

        if(!files.receipt || !files.receipt.path) {
            res.status(400);
            return res.json({
                code: 400,
                error: 'badRequest',
                case: 'receipt field'
            })
        }

        let path = __dirname + '/' + files.receipt.path;
        console.log(fs.existsSync(path));
        console.log(path);

        new Promise(resolve => {

            request({
                    method: 'POST',
                    uri: 'http://localhost:8080/ocr',
                    json: {
                        "file": path
                    }
                }, (err, response, body) => resolve(body)
            )

        }).then(body => res.json(body))

    });
});

app.post('/api/receipt/feedback', (req, res) => {

    new Promise(resolve => {

        request({
            method: 'POST',
            uri: 'http://localhost:8080/feedback',
            json: req.body
        }, (err, response, body) => resolve(body)
        )

    }).then(body => res.json(body) )
});

app.post('/api/user/new', (req, res) => {

    console.log('POST /api/user/new');
    console.log('\tbody: ', req.body);

    if(!req.body.login || !req.body.password) {
        res.status(400)
        res.json({
            "code": 400,
            "error": "badRequest"
        })
    }

    db.addUser(req.body)
        .then(result => res.json(result))
        .catch(err => res.json(err))
});


app.post('/api/user/login', (req, res) => {

    console.log('POST /api/user/login');
    console.log('\tbody: ', req.body);

    if(!req.body.login || !req.body.password) {
        res.status(400)
        res.json({
            "code": 400,
            "error": "badRequest"
        })
    }

    db.login(req.body)
        .then(result => res.json(result))
        .catch(err => res.json(err))
});

app.get('/api/user/list', (req, res) => {

    console.log('GET /api/user/list');
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
