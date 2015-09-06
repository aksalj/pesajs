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

var checkoutService = new MPesa.CheckoutService();

checkoutService.paymentNotification({}, null, function(req, res) {
    // Get parsed notification
    var ipn = req.ipn;
    console.log(ipn);
});


var cart = new MPesa.Cart(34546, "Maziwa", "254710000000", "254710000000", "https://awesome-shop.co.ke/ipn");
cart.Details = "Additional transaction details if any";

checkoutService.requestCheckout(cart, function(err, resp) {
    console.error(err);
    console.error(resp.toJSON().body);

    // Now if ok show message to user and allow them to confirm
    // ...

    checkoutService.confirmCheckout({}, function(err, resp) {
        console.error(err);
        console.info(resp.toJSON().body);
    });
});