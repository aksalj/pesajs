/**
 *  Copyright (c) 2015 Salama AB
 *  All rights reserved
 *  Contact: aksalj@aksalj.com
 *  Website: http://www.aksalj.com
 *
 *  Project : pesajs
 *  File : lnmo/index
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
const UTF8 = require("crypto-js/enc-utf8");
const SHA256 = require("crypto-js/sha256");
const BASE64 = require("crypto-js/enc-base64");
const xml2json = require("xml2json");

const Const = require("../../constants");

const OPERATIONS = {
    PAYMENT_RESULT: "LNMOResult",
    REQUEST_PAYMENT: "processCheckoutRequest",
    QUERY_PAYMENT_STATUS: "transactionStatusRequest",
    CONFIRM_PAYMENT: "transactionConfirmRequest"
};

let request = Const.BaseRequest;
let DEBUG = false;


class PaymentService {

    constructor(params) {
        let options = params || {};

        if (!options.merchant || !options.passkey) throw new Error("Need to specify both merchant ID and passkey");

        DEBUG = options.debug || false;

        if (DEBUG) {
            require('request-debug')(request);
        }

        this._makePassword = function (timestamp) {
            if (!timestamp) {
                timestamp = Date.now();
            }
            return BASE64.stringify(UTF8.parse(SHA256(options.merchant + options.passkey + timestamp).toString().toUpperCase()));
        };

        this._parseXMLResponse = function(op, xml) {

            var data = null;
            try {
                var json = xml2json.toJson(xml,{object: true});
                var body = json["SOAP-ENV:Envelope"]["SOAP-ENV:Body"];
                var response = null;

                if(body.hasOwnProperty("SOAP-ENV:Fault")){
                    var fault = body["SOAP-ENV:Fault"];
                    data = {
                        error: new Const.Error(fault.faultcode, fault.faultstring)
                    };
                    return data;
                }


                switch (op) {
                    case OPERATIONS.PAYMENT_RESULT:
                        response = body["ns1:ResultMsg"];

                        data = { // FIXME: Seems to be same as OPERATIONS[2]
                            code: parseInt(response['RETURN_CODE']),
                            description: response['DESCRIPTION'],

                            account: response['MSISDN'],
                            amount: response['AMOUNT'],
                            date: response['M-PESA_TRX_DATE'],
                            status: response['TRX_STATUS'],
                            mpesa_txn: response['TRX_ID'],
                            internal_txn: response['M-PESA_TRX_ID'],
                            transaction: response['MERCHANT_TRANSACTION_ID'],
                            details: response['ENC_PARAMS']
                        };

                        break;
                    case OPERATIONS.REQUEST_PAYMENT:
                        response = body["ns1:processCheckOutResponse"];
                        data = {
                            code: parseInt(response['RETURN_CODE']),
                            description: response['DESCRIPTION'],
                            mpesa_txn: response['TRX_ID'],
                            message: response['CUST_MSG'],
                            details: response['ENC_PARAMS']
                        };

                        break;
                    case OPERATIONS.QUERY_PAYMENT_STATUS:
                        response = body["ns1:transactionStatusResponse"];

                        data = {
                            code: parseInt(response['RETURN_CODE']),
                            description: response['DESCRIPTION'],

                            account: response['MSISDN'],
                            amount: response['AMOUNT'],
                            date: response['M-PESA_TRX_DATE'],
                            status: response['TRX_STATUS'],
                            mpesa_txn: response['TRX_ID'],
                            internal_txn: response['M-PESA_TRX_ID'],
                            transaction: response['MERCHANT_TRANSACTION_ID'],
                            details: response['ENC_PARAMS']
                        };


                        break;
                    case OPERATIONS.CONFIRM_PAYMENT:
                        response = body["ns1:transactionConfirmResponse"];
                        data = {
                            code: parseInt(response['RETURN_CODE']),
                            description: response['DESCRIPTION'],
                            mpesa_txn: response['TRX_ID'],
                            transaction: response['MERCHANT_TRANSACTION_ID']
                        };


                        break;
                }

                if(data.code && data.code != 0){
                    data.error = new Const.Error(data.code, data.description);
                }

            } catch(er) {
                data = {
                    error: er
                };
            }

            return data;
        };
        
        this._trigger = function(op, data) {
            return new Promise((resolve, reject) => {

                // Auth
                data.merchant = options.merchant;
                data.password = this._makePassword(data.timestamp || Date.now());


                let body = require(`./xml/${op}.xml`)(data);
                if (!body) {
                    return reject(new Error("Could not construct soap message"));
                }
                
                let params = {
                    url: Const.URLS.CHECKOUT,
                    method: 'POST',
                    body: body
                };
                request(params, (err, response, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        let data = this._parseXMLResponse(op, result);
                        if (data.error) {
                            reject(data.error);
                        } else {
                            resolve(data);
                        }
                    }
                });
            });
        }
    }

    /**
     * Initiate payment process
     * @param args Cart
     */
    requestPayment(args) {
        
        return new Promise((resolve, reject) => {

            if (!args) {
                return reject(new Error("No payment data provided"));
            }

            // TODO: Validate args content
            /*
             args.transaction;
             args.ref;
             args.account;
             args.amount;
             args.details; // this is optional
             args.callbackUrl;
             args.timestamp = Date.now();
             */
            
            args.timestamp = args.timestamp || Date.now();
            args.callbackMethod = "xml"; // get | post | xml; documentation not clear on how to send this param.
            

            if(DEBUG) {
                console.log("D: requesting checkout...");
            }
            return this._trigger(OPERATIONS.REQUEST_PAYMENT, args).then(resolve).catch(reject);
        });
    }

    /**
     * Confirm payment request
     * @param args
     */
    confirmPayment(args) {

        return new Promise((resolve, reject) => {

            if (!args) {
                return reject(new Error("No transaction info provided"));
            }

            // TODO: Validate args content
            // args.transaction
            // args.mpesa_txn


            if(DEBUG) {
                console.log("D: confirming checkout...");
            }
            return this._trigger(OPERATIONS.CONFIRM_PAYMENT, args).then(resolve).catch(reject);
        });

    }


    /**
     * Check transaction status
     * @param args
     */
    getPaymentStatus(args) {
        return new Promise((resolve, reject) => {

            if (!args) {
                return reject(new Error("No transaction info provided"));
            }

            // TODO: Validate args content
            // args.transaction
            // args.mpesa_txn


            if(DEBUG) {
                console.log("D: getting transaction status...");
            }
            return this._trigger(OPERATIONS.QUERY_PAYMENT_STATUS, args).then(resolve).catch(reject);
        });
    }


    /**
     * Payment notification express/connect middleware
     * @param req
     * @param res
     * @param next
     */
    paymentNotification(req, res, next) {

        let xml = req.body; // GET params? Plain POST? XML POST?

        let data = this._parseXMLResponse(OPERATIONS.PAYMENT_RESULT, xml);

        if (data.error) {
            req.payment = null;

            console.error(error);

            res.sendStatus(500);
        } else {
            req.payment = data;
            if (next) {
                next(req, res);
            } else {
                res.sendStatus(200);
            }
        }
    }
}

exports = module.exports = PaymentService;
