const request = require("request");
const crypto = require('crypto');
const childProcess = require('child_process');
require('dotenv').config({
    path: __dirname + '/.env'
});

describe("Receiver", () => {

    let server;
    const data = {};

    beforeAll(() => {
        spyOn(childProcess, "exec");
        server = require("../github-webook-receiver");
    });

    beforeAll((done) => {

        var reqData = {
            url: "http://localhost:9530/",
            //json: true,
            headers: {
                "content-type": "application/json",
                "X-GitHub-Event": "push",
                "X-Hub-Signature": "sha1=1bc649b29429bd48545c92f7eeb7ac6d9f21b642"
            },
            body: `{"ref": "refs/heads/master",
            "repository": {
                "id": 285082216,
                "node_id": "MDEwOlJlcG9zaXRvcnkyODUwODIyMTY=",
                "name": "aqara_hub_monitor"
            }
            }`
        }

        request.post(reqData, (error, response, body) => {
            data.status = response.statusCode;
            data.body = body;
            done();
        });
    });

    afterAll(() => {
        server.close();
    });

    it("should handle a github webhook", () => {
        expect(childProcess.exec).toHaveBeenCalledTimes(1);
    });
});