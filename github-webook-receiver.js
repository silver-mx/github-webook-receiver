require('dotenv').config({
    path: __dirname + '/.env'
});

const http = require('http');
const crypto = require('crypto');
const {
    exec
} = require('child_process');

const Push = require('pushover-notifications');

const p = new Push({
    user: process.env['PUSHOVER_USER'],
    token: process.env['PUSHOVER_TOKEN'],
});

const msg = {
    message: 'TBD', // required
    title: 'github - webhook - receiver error',
    sound: 'magic',
    device: 'raspberry',
    priority: 1
}

const SECRET = process.env['SECRET'];

http
    .createServer((req, res) => {
        req.on('data', chunk => {
            const signature = `sha1=${crypto
        .createHmac('sha1', SECRET)
        .update(chunk)
        .digest('hex')}`;

            console.log(`CHUNK=${chunk}`);

            const isAllowed = req.headers['x-hub-signature'] === signature;

            const body = getBodyAsJson(chunk);

            const isMaster = body.ref === 'refs/heads/master';

            if (isAllowed && isMaster) {

                const repository = body.repository.name;
                console.log(`Push detected for repository ${repository}...`);

                try {
                    exec(`cd /home/pi/wa/${repository} && git pull && npm install`);
                } catch (error) {
                    console.log(error);
                }
            }
        });

        res.end();
    })
    .listen(9530);

const getBodyAsJson = (chunk) => {
    try {
        return JSON.parse(chunk);
    } catch (error) {
        msg.message = error;
        p.send(msg, (err, result) => {
            if (err) {
                throw err
            }
        });
    }
};