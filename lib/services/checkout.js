/**
 *  Copyright (c) 2015 Salama AB
 *  All rights reserved
 *  Contact: aksalj@aksalj.com
 *  Website: http://www.aksalj.com
 *
 *  Project : pesajs
 *  File : checkout
 *  Date : 9/5/15 2:34 PM
 *  Description : M-PESA G2 API; DEVELOPERS GUIDE - LIPA NA M-PESA ONLINE CHECKOUT v 2.0
 *
 *  1.    The Merchant captures the payment details and prepares call to the SAG’s endpoint.
 *  2.    The Merchant invokes SAG’s processCheckOut interface.
 *          The SAG validates the request sent and returns a response.
 *  3.    Merchant receives the processCheckoutResponse parameters namely TRX_ID, ENC_PARAMS, RETURN_CODE, DESCRIPTION and
 *          CUST_MSG (Customer message).
 *  4.    The merchant is supposed to display the CUST_MSG to the customer after which the merchant should invoke SAG’s
 *          confirmPaymentRequest interface to confirm the transaction
 *  5.    The system will push a USSD menu to the customer and prompt the customer to enter their BONGA PIN and any other
 *          validation information.
 *  6.    The transaction is processed on M-PESA and a callback is executed after completion of the transaction.

 *
 */
'use strict';
const soap = require('easysoap');
const UTF8 = require("crypto-js/enc-utf8");
const SHA256 = require("crypto-js/sha256");
const BASE64 = require("crypto-js/enc-base64");
const Const = require("../constants");

class CheckoutService {

    constructor() {

        // create a soap client
        this.soapClient = null;
        const timestamp = Date.now();
        const soapOptions = {

            // https://www.safaricom.co.ke/mpesa_online/lnmo_checkout_server.php?wsdl
            host: 'www.safaricom.co.ke',
            path: '/mpesa_online/lnmo_checkout_server.php',
            wsdl: '/mpesa_online/lnmo_checkout_server.php?wsdl',

            headers: [{
                'name': 'CheckOutHeader',
                'value': {
                    MERCHANT_ID: Const.MERCHANT.ID,
                    TIMESTAMP: timestamp,
                    REFERENCE_ID: null,
                    PASSWORD: BASE64.stringify(
                        UTF8.parse(
                            SHA256(
                                Const.MERCHANT.ID + Const.MERCHANT.PassKey + timestamp
                            ).toString().toUpperCase()
                        )
                    )
                },
                'namespace': 'tns'
            }]

        };
        this.soapClient = soap.createClient(soapOptions, {secure: false});

        if (Const.DEBUG) {
            this.soapClient.getAllFunctions()
                .then((functionArray) => {
                    console.log(functionArray);
                })
                .catch((err) => {
                    console.error(err);
                    process.exit(1);
                });
        }


    }

    /**
     * Initiate checkout process
     * @param cart Cart
     */
    requestCheckout(cart) {

        let args = {
            MERCHANT_TRANSACTION_ID: cart.Transaction,
            REFERENCE_ID: cart.Ref,
            AMOUNT: cart.Amount,
            MSISDN: cart.Account,
            ENC_PARAMS: cart.Details,
            CALL_BACK_URL: cart.CallbackUrl,
            CALL_BACK_METHOD: "xml", // get | post | xml; documentation not clear on how to send this param.
            TIMESTAMP: Date.now()
        };


        let params = {
            method: "processCheckout",
            attributes: {
                xmlns: ''
            },
            params: args
        };

        if(Const.DEBUG) {
            console.log("requesting checkout...");
        }

        return this.soapClient.call(params);
    }

    /**
     * Confirm checkout transaction
     * @param args
     */
    confirmCheckout(args) {

        /*
         Transaction
         TXN_MPESA
         */

        let params = {
            MERCHANT_TRANSACTION_ID: args.Transaction,
            TRX_ID: args.TXN_MPESA,
            TIMESTAMP: Date.now()
        };

        let options = {
            method: "confirmCheckout",
            attributes: {
                xmlns: ''
            },
            params: args
        };
        if(Const.DEBUG) {
            console.log("confirming checkout...");
        }
        return this.soapClient.call(options);
    }


    /**
     * Check transaction status
     * @param args
     */
    getTransactionStatus(args) {

        /*
         Transaction
         TXN_MPESA
         */

        var params = {
            MERCHANT_TRANSACTION_ID: args.Transaction,
            TRX_ID: args.TXN_MPESA
        };

        let options = {
            method: "transactionStatusQuery",
            attributes: {
                xmlns: ''
            },
            params: params
        };
        if(Const.DEBUG) {
            console.log("getting transaction status...");
        }
        return this.soapClient.call(options);
    }


    /**
     * Payment notification middleware
     * @param req
     * @param res
     * @param next
     */
    paymentNotification(req, res, next) {

        var args = req.body; // GET params? Plain POST? XML POST?

        let options = {
            method: "LNMOResult",
            attributes: {
                xmlns: ''
            },
            params: args
        };
        this.soapClient.call(options).then((resp) => {
            // TODO: Respond to SAG and make sure next middleware doesn't send anything
            if (resp.error) {
                console.error(resp.error);
                res.sendStatus(500);
            } else {
                req.payment = resp.data;
                if (next) {
                    next(req, res);
                } else {
                    res.sendStatus(200);
                }
            }
        }).catch((err) => {
            console.error(err);
            res.sendStatus(500);
        });

    }
}

exports = module.exports = CheckoutService;
