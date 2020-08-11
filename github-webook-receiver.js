require('dotenv').config({
    path: __dirname + '/.env'
});

//const http = require('http');
const express = require('express')
var bodyParser = require('body-parser');
const crypto = require('crypto');
const {
    exec
} = require('child_process');

const app = express()
app.use(bodyParser.json({
    verify: verifySignature
}));

const SECRET = process.env['SECRET'];

function verifySignature(req, res, buf, encoding) {
    const expected = `sha1=${crypto
        .createHmac('sha1', SECRET)
        .update(buf)
        .digest('hex')}`;

    if (req.headers['x-hub-signature'] !== expected) {
        throw new Error('Invalid signature');
    }
}

app.post('/', (req, res) => {

    const body = req.body;

    const isMaster = body.ref === 'refs/heads/master';

    if (isMaster) {

        const repository = body.repository.name;
        console.log(`Push detected for repository ${repository}...`);

        try {
            exec(`cd /home/pi/wa/${repository} && git pull && npm install`);
        } catch (error) {
            console.log(error);
        }
    }

    res.sendStatus(200);
}).listen(9530);