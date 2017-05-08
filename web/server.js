'use strict';

const express = require('express');
const app = express();
const multer = require('multer');
const request = require('request');
const bodyParser = require('body-parser');

const upload = multer({dest: 'uploads/'});
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.end('receipt recognation fake backend')
});

app.post('/api/receipt/ocr', upload.single('receipt'), (req, res) => {

    new Promise(resolve => {

        request({
            method: 'POST',
            uri: 'http://localhost:8080/ocr',
            json: {
                "file": req.file
            }
        }, (err, response, body) => resolve(body)
        )

    }).then(body => res.json(body) )
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

    res.json({
        "userToken": "123456789"
    });
});


app.post('/api/user/login', (req, res) => {

    console.log('POST /api/user/login');
    console.log('\tbody: ', req.body);

    res.json({
        "userToken": "123456789"
    });
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
})

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
})


app.listen(port,  () => console.log(`Server listening on port ${port}!`) );
