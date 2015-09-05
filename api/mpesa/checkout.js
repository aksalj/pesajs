/**
 *  Copyright (c) 2015 Salama AB
 *  All rights reserved
 *  Contact: aksalj@aksalj.me
 *  Website: http://www.aksalj.me
 *
 *  Project : pesajs
 *  File : checkout
 *  Date : 9/5/15 2:34 PM
 *  Description :
 *
 */
'use strict';
var soap = require('soap');
var _ = require("lodash");

var OPERATIONS = [ "processCheckOut", "transactionStatusQuery", "confirmTransaction", "LNMOResult"];



exports = module.exports = {
    name: "Checkout",

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

        if(!soapClient) {
            throw new Error("Invalid soap client!");
        }

        // Add expected CheckoutHeader
        var soapHeader = {
            "tns:CheckoutHeader": {
                "MERCHANT_ID": null,
                "REFERENCE_ID": null,
                "TIMESTAMP": null,
                "PASSWORD": null // 	TODO: base64_encode(hash("sha256", MERCHANT_ID, passkey, TIMESTAMP));
            }
        };
        soapClient.addSoapHeader(soapHeader, "", "tns", "tns:ns"); //soapHeader, name, namespace, xmlns


        soapClient[operation](params, function(err, result, raw, soapHeader) {
            callback(err, result);
        });
    }

};