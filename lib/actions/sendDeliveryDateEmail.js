'use strict'

const fetch = require('node-fetch')
const util = require('util')
const deliveryDateHTMLEmail = require('../templates/deliveryDateHTMLEmail.js')
const deliveryDateTextEmail = require('../templates/deliveryDateTextEmail.js')

exports.process = function (msg, cfg) {
  const self = this

  let emailRequests = msg.body.currentMessage.orders.map(order => {
    if (order.email !== "missingcustomeremail@matalandirect.com" &&
        order.shipping_lines.find(shippingLine => shippingLine.code.match(/PALLET/))) {
      let options = {
        method: 'POST',
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "X-Postmark-Server-Token": cfg.serverToken
        },
        body: buildEmailRequest(order)
      }
      console.log(`${order.name} delivery type is PALLET, sending email...`)
      console.log("Sending email request to Postmark:", options.body)
      return fetch(`${cfg.postmarkHost}/email`, options)
             .then(res => {
               if (res.status == 200) {
                 return res.json()
               } else {
                 return res.json()
                 .then(json => {
                   return Promise.reject(new Error(`Postmark returned status code: ${res.status}. ${util.inspect(json, false, null)}`))
                 })
               }
             })
             .then(json => {
               console.log("Postmark response: ", json)
               return json
             })
    } else {
      console.log(`Email address is missing or ${order.name} delivery type is not PALLET, skipping sending email`)
      return Promise.resolve(true)
    }
  })

  Promise.all(emailRequests)
  .then(emitData)
  .catch(emitError)
  .then(emitEnd)

  function emitData(data) {
    console.log("Emitting original data")
    self.emit('data', msg);
  }

  function emitError(e) {
    console.log('Oops! Error occurred:', e);
    self.emit('error', e);
  }

  function emitEnd() {
    console.log('Finished execution');
    self.emit('end');
  }

  function buildEmailRequest(order) {
    let templateData = {
      deliveryDate: dateFromDeliveryCode(order.shipping_lines[0].code),
      firstName: capitalizeFirstLetter(order.customer.first_name.match(/\s([A-Za-z]+)$/)[1]),
      orderNumber: order.name
    }

    return JSON.stringify({
      "From": cfg.from,
      "To": order.email,
      "Subject": `Your delivery is booked in for ${templateData.deliveryDate}`,
      "Tag": "DeliveryDateEmail",
      "HtmlBody": deliveryDateHTMLEmail(templateData),
      "TextBody": deliveryDateTextEmail(templateData)
    })
  }

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  }

  function dateFromDeliveryCode(code) {
    let dateString = code.match(/_(\d+-\d+-\d+)$/)[1]
    let date = new Date()
    date.setTime(Date.parse(dateString))
    return `${date.getUTCDate()}/${date.getUTCMonth() + 1}/${date.getUTCFullYear()}`
  }
}
