'use strict';

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
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

    console.log('POST /api/receipt/ocr');

    recognition.hasToken(req)
        .then(() => db.checkToken(req.query['userToken']))
        .then(() => recognition.receivePhoto(req))
        .then(path => recognition.ocr(path))
        .then(receipt => db.saveReceipt(receipt, req.query['userToken']))
        .then(receipt => res.json(receipt))
        .catch(err => {
            res.status(err.code);
            res.json(err)
        });
});

app.post('/api/receipt/feedback', (req, res) => {

    console.log('POST /api/receipt/feedback');

    recognition.hasToken(req)
        .then(() => db.checkToken(req.query['userToken']))
        .then(() => recognition.feedback(req.body))
        .then(body => res.json(body))
        .catch(err => {
            res.status(err.code);
            res.json(err)
        });
});

app.post('/api/user/new', (req, res) => {

    console.log('POST /api/user/new');

    recognition.hasLoginAndPassword(req)
        .then(() => db.addUser(req.body))
        .then(result => res.json(result))
        .catch(err => {
            res.status(err.code);
            res.json(err)
        });
});


app.post('/api/user/login', (req, res) => {

    console.log('POST /api/user/login');

    recognition.hasLoginAndPassword(req)
        .then(() => db.login(req.body))
        .then(result => res.json(result))
        .catch(err => {
            res.status(err.code);
            res.json(err)
        });
});

app.get('/api/user/list', (req, res) => {

    console.log('GET /api/user/list');

    recognition.hasToken(req)
        .then(() => db.checkToken(req.query['userToken']))
        .then(() => db.getReceipts(req.query, req.query['userToken']))
        .then(receipts => res.json({receipts: receipts}))
        .catch(err => {
            res.status(err.code);
            res.json(err)
        });
});

app.post('/api/user/sync', (req, res) => {

    console.log('POST /api/user/sync');

    recognition.hasToken(req)
        .then(() => db.checkToken(req.query['userToken']))
        .then(() => db.syncReceipts(req.body, req.query['userToken']))
        .then(receipts => res.json(receipts))
        .catch(err => {
            res.status(err.code);
            res.json(err)
        });
});


app.listen(port,  () => console.log(`Server listening on port ${port}!`) );
