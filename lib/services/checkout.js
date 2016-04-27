/**
 *  Copyright (c) 2015 Salama AB
 *  All rights reserved
 *  Contact: aksalj@aksalj.me
 *  Website: http://www.aksalj.me
 *
 *  Project : pesajs
 *  File : checkout
 *  Date : 9/5/15 2:34 PM
 *  Description : M-PESA G2 API; DEVELOPERS GUIDE - LIPA NA M-PESA ONLINE CHECKOUT v 2.0
 *
 *  1.	The Merchant captures the payment details and prepares call to the SAG’s endpoint.
 *  2.	The Merchant invokes SAG’s processCheckOut interface.
 *          The SAG validates the request sent and returns a response.
 *  3.	Merchant receives the processCheckoutResponse parameters namely TRX_ID, ENC_PARAMS, RETURN_CODE, DESCRIPTION and
 *          CUST_MSG (Customer message).
 *  4.	The merchant is supposed to display the CUST_MSG to the customer after which the merchant should invoke SAG’s
 *          confirmPaymentRequest interface to confirm the transaction
 *  5.	The system will push a USSD menu to the customer and prompt the customer to enter their BONGA PIN and any other
 *          validation information.
 *  6.	The transaction is processed on M-PESA and a callback is executed after completion of the transaction.

 *
 */
'use strict';
const path = require('path');
const soap = require('soap');
const UTF8 = require("crypto-js/enc-utf8");
const SHA256 = require("crypto-js/sha256");
const BASE64 = require("crypto-js/enc-base64");
const Const = require("../constants");

const WSDL = "https://www.safaricom.co.ke/mpesa_online/lnmo_checkout_server.php?wsdl";


class CheckoutService {

    constructor() {

        let request = Const.BaseRequest;

        if(Const.DEBUG) {
            require('request-debug')(request);
        }

        // create a soap client
        this.soapClient = null;
        const soapOptions = {
            request: request

        };
        soap.createClient(WSDL, soapOptions, (err, client) => {

            if (err) { throw err; }

            this.soapClient = client;
        });

    }

    _addAuthHeader(timestamp, reference) {
        let header = {
            MERCHANT_ID: Const.MERCHANT.ID,
            TIMESTAMP: timestamp,
            REFERENCE_ID: reference || null,
            PASSWORD: BASE64.stringify(
                UTF8.parse(
                    SHA256(
                        Const.MERCHANT.ID + Const.MERCHANT.PassKey + timestamp
                    ).toString().toUpperCase()
                )
            )
        };
        this.soapClient.changeSoapHeader(0, {"CheckOutHeader": header}, "", "tns", "tns:ns");
    }

    /**
     * Initiate checkout process
     * @param cart Cart
     * @param callback
     */
    requestCheckout(cart, callback) {

        var params = {
            MERCHANT_TRANSACTION_ID: cart.Transaction,
            REFERENCE_ID: cart.Ref,
            AMOUNT: cart.Amount,
            MSISDN: cart.Account,
            ENC_PARAMS: cart.Details,
            CALL_BACK_URL: cart.CallbackUrl,
            CALL_BACK_METHOD: "xml", // get | post | xml; documentation not clear on how to send this param.
            TIMESTAMP: Date.now()
        };

        this._addAuthHeader(params.TIMESTAMP, params.REFERENCE_ID);
        this.soapClient.processCheckOut(params, callback);
    }

    /**
     * Confirm checkout transaction
     * @param args
     * @param callback
     */
    confirmCheckout(args, callback) {

        /*
         Transaction
         TXN_MPESA
         */

        var params = {
            MERCHANT_TRANSACTION_ID: args.Transaction,
            TRX_ID: args.TXN_MPESA,
            TIMESTAMP: Date.now()
        };

        this._addAuthHeader(params.TIMESTAMP, params.MERCHANT_TRANSACTION_ID);
        this.soapClient.confirmTransaction(params, callback);
    }


    /**
     * Check transaction status
     * @param args
     * @param callback
     */
    getTransactionStatus(args, callback) {

        /*
         Transaction
         TXN_MPESA
         */

        var params = {
            MERCHANT_TRANSACTION_ID: args.Transaction,
            TRX_ID: args.TXN_MPESA
        };

        this._addAuthHeader(Date.now(), params.MERCHANT_TRANSACTION_ID);
        this.soapClient.transactionStatusQuery(params, callback);
    }


    /**
     * Payment notification middleware
     * @param req
     * @param res
     * @param next
     */
    paymentNotification(req, res, next) {

        var args = req.body; // GET params? Plain POST? XML POST?

        this._addAuthHeader(Date.now(), null);
        this.soapClient.LNMOResult(args, (err, data) => {
            // TODO: Respond to SAG and make sure next middleware doesn't send anything
            console.error(err);


            req.payment = data;
            if(next) {
                next(req, res);
            }
        });
    }
}

exports = module.exports = CheckoutService;
