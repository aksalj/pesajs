/**
 *  Copyright (c) 2015 Salama AB
 *  All rights reserved
 *  Contact: aksalj@aksalj.com
 *  Website: http://www.aksalj.com
 *
 *  Project : pesajs
 *  File : app
 *  Date : 9/5/15 1:14 PM
 *  Description :
 *
 */
'use strict';
const express = require("express");
const bodyParser = require('body-parser');
const randomstring = require("randomstring");
const morgan = require('morgan');

const MPesa = require("../index")({
    id: "898945",
    passkey: "SuperSecretPassKey",
    debug: true
});


const checkoutService = new MPesa.CheckoutService();

const app = express();

app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('static'));

app.post('/checkout/:action(request|confirm)', function (req, res, next) {

    switch(req.params.action) {
        case "request":

            let transaction = randomstring.generate();
            let ref = req.body.reference;
            let phone = req.body.phone;
            let amount = req.body.amount;


            let cart = new MPesa.Cart(transaction, ref, phone, amount, "http://awesome-store.co.ke/ipn");
            cart.Details = "Additional transaction details if any";

            checkoutService.requestCheckout(cart, function(err, data) {
                if(err) {
                    console.error(err);
                    res.sendStatus(500);
                    return;
                }
                console.info(data);

                // Now if ok show message to user and allow them to confirm
                // ...

                res.send({
                    transaction: transaction,
                    mpesa_txn: data.TXN_MPESA,
                    message: data.Message
                });
            });

            break;
        case "confirm":

            let args = {
                Transaction: req.body.transaction,
                TXN_MPESA: req.body.mpesa_transaction
            };

            checkoutService.confirmCheckout(args, function(err, data) {
                if(err) {
                    console.error(err);
                    res.sendStatus(500);
                    return;
                }
                console.info(data);


                res.send({
                    message: "Thank you for doing business with us. Buy some more stuff while we wait for payment to be processed!"
                });
            });

            break;
        default:
            next();
            break;
    }

});

app.post("/ipn", checkoutService.paymentNotification, function(req, res) {
    // Do whatever with payment info like confirm purchase, init shipping, send download link, etc.
    let ipn = req.payment;
    console.log(ipn);
});

app.get("/status", function(req, res) {
    let args = {
        Transaction: randomstring.generate(),
        TXN_MPESA: randomstring.generate()
    };
    checkoutService.getTransactionStatus(args, function(err, data) {
        console.error(err);
        console.error(data);
        res.send(data);
    });
});


var server = app.listen(3000, function () {
    let host = server.address().address;
    let port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});