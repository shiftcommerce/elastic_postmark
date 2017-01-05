"use strict"

const fetch = require('node-fetch')

module.exports = function(credentials, callback) {
  let options = {
    headers: {
      "X-Postmark-Server-Token": credentials.serverToken,
      "Accept": "application/json"
    }
  }

  fetch(`${credentials.postmarkHost}/deliverystats`, options)
  .then(res => {
    if (res.status == 200) {
      callback(null, { verified: true })
    } else {
      console.log(`Postmark responded with HTTP code ${res.status}`)
      callback(null, { verified: false })
    }
  })
  .catch(err => {
    console.log(err)
    callback(null, { verified: false })
  })
}