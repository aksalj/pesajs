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

const PesaJs = require("../index");

const paymentService = new PesaJs.LipaNaMpesa({
    merchant: "320320",
    passkey: "SuperSecretPassKey",
    debug: true
});

const app = express();

app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('static'));

app.post('/checkout/:action(request|confirm)', function (req, res, next) {

    switch(req.params.action) {
        case "request":
            
            let cart = {
                transaction: randomstring.generate(),
                ref: req.body.reference,
                account: req.body.phone,
                amount: req.body.amount,
                callbackUrl: "http://awesome-store.co.ke/ipn",
                details: "Additional transaction details if any"
            };

            paymentService.requestPayment(cart).then((data) => {
                console.info(data);

                // Now if ok show message to user and allow them to confirm
                // ...

                res.send({
                    transaction: cart.transaction,
                    mpesa_txn: data.mpesa_txn,
                    message: data.message
                });
            }).catch((function(err) {
                console.error(err);
                res.status(500).send(err);
            }));


            break;
        case "confirm":

            let args = {
                transaction: req.body.transaction,
                mpesa_txn: req.body.mpesa_transaction
            };

            paymentService.confirmPayment(args).then(function(err, data) {
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

app.post("/ipn", paymentService.paymentNotification, function(req, res) {
    // Do whatever with payment info like confirm purchase, init shipping, send download link, etc.
    let ipn = req.payment;
    console.log(ipn);
});

app.get("/status/:transaction", function(req, res) {
    let args = {
        transaction: req.params.transaction,
        mpesa_txn: null
    };
    paymentService.getPaymentStatus(args).then(function(err, data) {
        console.error(err);
        console.error(data);
        res.send(data);
    });
});


var server = app.listen(process.env.PORT || 3000, function () {
    let host = server.address().address;
    let port = server.address().port;

    console.log('Shopping app listening at http://%s:%s', host, port);
});