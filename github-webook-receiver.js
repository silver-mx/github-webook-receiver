require('dotenv').config({
    path: __dirname + '/.env'
});

const http = require('http');
const crypto = require('crypto');
const {
    exec
} = require('child_process');

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

            const body = JSON.parse(chunk);

            const isMaster = body.ref === 'refs/heads/master';

            if (isAllowed && isMaster) {

                const repository = body.repository.name;
                console.log(`Push detected for repository ${repository}...`);

                try {
                    exec(`cd /home/pi/wa/${repository} && git pull && npm install && systemctl restart ${repository}`);
                } catch (error) {
                    console.log(error);
                }
            }
        });

        res.end();
    })
    .listen(9530);