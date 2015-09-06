/**
 *  Copyright (c) 2015 Salama AB
 *  All rights reserved
 *  Contact: aksalj@aksalj.me
 *  Website: http://www.aksalj.me
 *
 *  Project : pesajs
 *  File : app
 *  Date : 9/5/15 1:14 PM
 *  Description :
 *
 */
'use strict';
var express = require("express");
var pesajs = require("../index");

var MPesa = pesajs.MPESA({
    ID: "898945",
    PassKey: "SuperSecretPassKey",
    debug: false
});


var checkoutService = new MPesa.CheckoutService();

var app = express();
app.use(express.static('static'));


app.post('/checkout/:action(request|confirm)', function (req, res) {

    var cart = new MPesa.Cart(34546, "Maziwa", "254710000000", "254710000000", "https://awesome-shop.co.ke/ipn");
    cart.Details = "Additional transaction details if any";

    checkoutService.requestCheckout(cart, function(err, resp) {
        console.error(err);
        console.error(resp.toJSON().body);

        // Now if ok show message to user and allow them to confirm
        // ...

        checkoutService.confirmCheckout({Transaction: cart.Transaction}, function(err, resp) {
            console.error(err);
            console.info(resp.toJSON().body);
        });
    });
});

app.all("/ipn", checkoutService.paymentNotification, function(req, res) {
    // Do whatever with payment info like confirm purchase, init shipping, send download link, etc.
    var ipn = req.payment;
    console.log(ipn);
});


var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});