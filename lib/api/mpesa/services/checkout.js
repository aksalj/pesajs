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
var soap = require('soap');
var _ = require("lodash");
var UTF8 = require("crypto-js/enc-utf8");
var SHA256 = require("crypto-js/sha256");
var BASE64 = require("crypto-js/enc-base64");

var Const = require("../constants");

var OPERATIONS = [ "LNMOResult", "processCheckOut", "transactionStatusQuery", "confirmTransaction"];

var _parseLNMOResult = function(params, callback) {
    /*
     <s:element minOccurs="1" name="MSISDN" type="s:string" />
     <s:element minOccurs="1" name="AMOUNT" type="s:string" />
     <s:element minOccurs="1" name="MPESA_TRX_DATE" type="s:string" />
     <s:element minOccurs="1" name="MPESA_TRX_ID" type="s:string" />
     <s:element minOccurs="1" name="TRX_STATUS" type="s:string" />
     <s:element minOccurs="1" name="RETURN_CODE" type="s:string" />
     <s:element minOccurs="1" name="DESCRIPTION" type="s:string" />
     <s:element minOccurs="1" name="MERCHANT_TRANSACTION_ID" type="s:string" />
     <s:element minOccurs="1" name="ENC_PARAMS" type="s:string" />
     <s:element minOccurs="1" name="TRX_ID" type="s:string" />
     */

    callback(new Error("Not Implemented!"));
};


exports = module.exports = {
    name: "Lipa Na M-PESA Online Checkout",

    // Production
    wsdl: "https://www.safaricom.co.ke/mpesa_online/lnmo_checkout_server.php?wsdl",
    endpoint: "https://www.safaricom.co.ke/mpesa_online/lnmo_checkout_server.php",

    // Development
    //wsdl: "/Users/aksalj/src/js/pesajs/doc/official/Checkout.wsdl",
    //endpoint: "http://localhost:5000",

    /**
     * Send a request to SAG
     * @param operation
     * @param soapClient
     * @param params
     * @param callback
     */
    trigger: function (operation, soapClient, params, callback) {

        if(!_.includes(OPERATIONS, operation)){
            throw new Error("Unsupported operation: " + operation + ". Only " + OPERATIONS + " are supported");
        }

        if (operation === OPERATIONS[0]) {
            return _parseLNMOResult(params, callback);
        }

        if(!soapClient) {
            throw new Error("Invalid soap client!");
        }

        // Add expected CheckoutHeader
        var hash = SHA256(Const.MERCHANT.ID + Const.MERCHANT.PassKey + params.TIMESTAMP).toString().toUpperCase();
        var soapHeader = {
            "tns:CheckoutHeader": {
                "MERCHANT_ID": Const.MERCHANT.ID,
                "TIMESTAMP": params.TIMESTAMP,
                "PASSWORD": BASE64.stringify(UTF8.parse(hash))
            }
        };
        if(params.REFERENCE_ID) {
            soapHeader["tns:CheckoutHeader"]["REFERENCE_ID"] = params.REFERENCE_ID;
        }
        soapClient.addSoapHeader(soapHeader, "", "tns", "tns:ns"); //soapHeader, name, namespace, xmlns


        soapClient[operation](params, function(err, result, raw, soapHeader) {
            callback(err, result);
        });
    }



};