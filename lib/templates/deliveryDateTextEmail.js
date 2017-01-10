"use strict"

module.exports = function(templateData) {
  return `Hi ${templateData.firstName},

Your order ${templateData.orderNumber} has been booked in for delivery on the ${templateData.deliveryDate}. Should you need to change the delivery date, please let us know by replying to this email or calling 0333 344 3177.

Your order will be delivered by our partner courier — Panther — who will contact you directly on the day before your delivery with a time slot and a tracking link for your order.

You will also benefit from:
* A two-man team to take your item to a room of your choice
* All packaging to be removed and taken away

If you have any questions in the meantime, please don’t hesitate to contact our customer services team on 0333 344 3177 or at hello@matalandirect.com`
}