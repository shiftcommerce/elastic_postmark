"use strict"

const sendDeliveryDateEmail = require('../lib/actions/sendDeliveryDateEmail.js').process
const nock = require('nock')
const deliveryDateHTMLEmail = require('../lib/templates/deliveryDateHTMLEmail.js')
const deliveryDateTextEmail = require('../lib/templates/deliveryDateTextEmail.js')

// fixtures
const input = require('./fixtures/sendDeliveryDateEmail/input.json')
const inputMissingEmail = require('./fixtures/sendDeliveryDateEmail/inputMissingEmail.json')
const emailResponse = require('./fixtures/sendDeliveryDateEmail/emailResponse.json')

nock.disableNetConnect()

console.log = () => {}

describe("Sending delivery date emails", () => {
  beforeEach((done) => {
    this.msg = {
      body: input
    }
    this.cfg = {
      serverToken: "servertoken",
      postmarkHost: "https://api.postmarkapp.com",
      from: "hello@matalandirect.com"
    }
    this.self = {
      emit(action) { if (action == 'end') done(); }
    }
    spyOn(this.self, 'emit').and.callThrough()

    let expectedTemplateData = {
      deliveryDate: "14/1/2017",
      firstName: "Jane",
      orderNumber: "MATDIR21304"
    }

    this.emailRequest = nock('https://api.postmarkapp.com')
    .post('/email', {
      "From": "hello@matalandirect.com",
      "To": "hubert.pompecki+pallet@matalandirect.com",
      "Subject": "Your delivery is booked in for 14/1/2017",
      "Tag": "DeliveryDateEmail",
      "HtmlBody": deliveryDateHTMLEmail(expectedTemplateData),
      "TextBody": deliveryDateTextEmail(expectedTemplateData) })
    .reply(200, emailResponse);

    sendDeliveryDateEmail.call(this.self, this.msg, this.cfg)
  })

  it("Sends an email with a delivery date for pallet orders only", () => {
    expect(this.emailRequest.isDone()).toBe(true)
  })

  it("Emits the original message", () => {
    let action = this.self.emit.calls.argsFor(0)[0]
    let payload = this.self.emit.calls.argsFor(0)[1].body
    expect(action).toEqual('data')
    expect(payload).toEqual(this.msg.body)
  })

  it("Emits end", () => {
    expect(this.self.emit).toHaveBeenCalledTimes(2)
    expect(this.self.emit).toHaveBeenCalledWith('end')
  })
})

describe("With missing email address", () => {
  beforeEach((done) => {
    this.msg = {
      body: inputMissingEmail
    }
    this.cfg = {
      serverToken: "servertoken",
      postmarkHost: "https://api.postmarkapp.com",
      from: "hello@matalandirect.com"
    }
    this.self = {
      emit(action) { if (action == 'end') done(); }
    }
    spyOn(this.self, 'emit').and.callThrough()

    sendDeliveryDateEmail.call(this.self, this.msg, this.cfg)
  })

  it("Emits the original message", () => {
    let action = this.self.emit.calls.argsFor(0)[0]
    let payload = this.self.emit.calls.argsFor(0)[1].body
    expect(action).toEqual('data')
    expect(payload).toEqual(this.msg.body)
  })

  it("Emits end", () => {
    expect(this.self.emit).toHaveBeenCalledTimes(2)
    expect(this.self.emit).toHaveBeenCalledWith('end')
  })
})
