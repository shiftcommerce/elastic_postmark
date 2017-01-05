"use strict";

const verifyCredentials = require('../verifyCredentials.js');
const nock = require('nock');

nock.disableNetConnect();

console.log = () => {}

describe("Credentials verification", () => {
  beforeEach(() => {
    this.credentials = {
      postmarkHost: "https://api.postmarkapp.com",
      serverToken: "apikey"
    };
  });

  describe("with correct credentials", () => {
    beforeEach((done) => {
      this.callback = (arg1, arg2) => {
        done();
      };
      spyOn(this, 'callback').and.callThrough();

      nock('https://api.postmarkapp.com')
        .get('/deliverystats')
        .reply(200);

      verifyCredentials(this.credentials, this.callback);
    });

    it("passed verification", () => {
      expect(this.callback).toHaveBeenCalledWith(null, { verified: true });
    });
  });

  describe("Unsuccessful verification", () => {
    beforeEach((done) => {
      this.callback = (arg1, arg2) => {
        done();
      };
      spyOn(this, 'callback').and.callThrough();

      nock('https://api.postmarkapp.com')
        .get('/deliverystats')
        .reply(422);

      verifyCredentials(this.credentials, this.callback);
    });

    it("passed verification", () => {
      expect(this.callback).toHaveBeenCalledWith(null, { verified: false });
    });
  });
});