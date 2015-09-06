/**
 *  Copyright (c) 2015 Salama AB
 *  All rights reserved
 *  Contact: aksalj@aksalj.me
 *  Website: http://www.aksalj.me
 *
 *  Project : pesajs
 *  File : index
 *  Date : 9/5/15 1:14 PM
 *  Description :
 *
 */
'use strict';

var pesajs = require("../index");
var MPesa = pesajs.MPESA({
    ID: "898945",
    PassKey: "SuperSecretPassKey",
    debug: false
});

var checkout = new MPesa.CheckoutService();

checkout.paymentNotification({}, null, function(req, res) {
    // Get parsed notification
    var ipn = req.ipn;
    console.log(ipn);
});

var cart = {
    Transaction: 34535,
    Ref: "Maziwa",
    Account: "254710000000",
    Amount: 59999,
    Details: "Additional transaction details if any",
    CallbackUrl: "https://awesome-shop.co.ke/ipn"
};
checkout.processCheckOut(cart, function(err, resp) {
    console.error(err);
    console.error(resp.toJSON().body);

    // Now if ok show message to user and allow them to confirm
    // ...

    checkout.confirmTransaction({}, function(err, resp) {
        console.error(err);
        console.info(resp.toJSON().body);
    });
});